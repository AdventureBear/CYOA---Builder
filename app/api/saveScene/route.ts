import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { Scene } from '@/app/types'


export async function POST(request: Request) {
    const scene: Scene = await request.json()

    try {
        await persistDynamicallyGeneratedScene(scene)
        return NextResponse.json({ message: 'Scene persisted successfully' })
    } catch (error) {
        console.error('Error persisting scene:', error)
        return NextResponse.json({ error: 'Failed to persist scene' }, { status: 500 })
    }
}

async function persistDynamicallyGeneratedScene(scene: Scene) {
    const filePath = path.join(process.cwd(), 'data', 'games', 'cute-animals', 'scenes.json')

    try {
        let content = await fs.readFile(filePath, 'utf8')

        // Check if the scene already exists
        if (content.includes(`${scene.id}: {`)) {
            console.log(`Scene '${scene.id}' already exists. Skipping persistence.`)
            return
        }

        // Convert the scene object to a string representation
        const sceneString = `
  ${scene.id}: {
    id: '${scene.id}',
    description: ${JSON.stringify(scene.description)},
    location: ${JSON.stringify(scene.location)},
    season: ${JSON.stringify(scene.season)},
    isRequired: ${scene.isRequired},
    actions: [
      ${(scene.actions || []).map(action => action).join(',')}
    ],
    choices: [
      ${scene.choices.map(choice => `{
        text: ${JSON.stringify(choice.text)},
        nextScene: '${choice.nextScene}'
      }`).join(',\n      ')}
    ]
  },`

        // Find the position to insert the new scene
        let insertPosition = content.lastIndexOf('export const scenes = {')
        if (insertPosition === -1) {
            insertPosition = content.lastIndexOf('export const scenes: Record<string, Scene> = {')
        }
        if (insertPosition === -1) {
            insertPosition = content.lastIndexOf('scenes = {')
        }
        if (insertPosition === -1) {
            throw new Error('Could not find the scenes object in the file')
        }

        // Insert the new scene after the opening brace of the scenes object
        const insertIndex = content.indexOf('{', insertPosition) + 1
        content = content.slice(0, insertIndex) + sceneString + content.slice(insertIndex)

        await fs.writeFile(filePath, content, 'utf8')
        console.log(`Scene '${scene.id}' has been saved to scenes.json`)
    } catch (error) {
        console.error('Error persisting scene:', error)
        throw error
    }
}
import { promises as fs } from 'fs'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const scene = req.body

  const filePath = path.join(process.cwd(), 'public', 'scenes', `${scene.id}.json`)
  await fs.writeFile(filePath, JSON.stringify(scene, null, 2))

  return res.status(200).json({ success: true, path: `/scenes/${scene.id}.json` })
}

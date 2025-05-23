import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { prompt } = await request.json()

    try {
        // This is a placeholder for the actual v0 API call
        // You'll need to replace this with the actual API endpoint and authentication
        const response = await fetch('https://api.v0.dev/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_V0_API_KEY'
            },
            body: JSON.stringify({ prompt })
        })

        if (!response.ok) {
            throw new Error('Failed to generate scene from v0')
        }

        const data = await response.json()

        return NextResponse.json({ response: data.response })
    } catch (error) {
        console.error('Error sending prompt to v0:', error)
        return NextResponse.json({ error: 'Failed to send prompt to v0' }, { status: 500 })
    }
}
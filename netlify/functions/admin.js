import { getStore } from '@netlify/blobs'

export default async (req) => {
  try {
    const body = await req.json()
    const { password } = body

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const store = getStore('raffle')
    const raw = await store.get('numbers')

    if (!raw) {
      return Response.json({ numbers: {} })
    }

    const numbers = JSON.parse(raw)

    return Response.json({ numbers })

  } catch (error) {
    return Response.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}
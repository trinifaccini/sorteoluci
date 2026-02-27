import { getStore } from '@netlify/blobs'

export default async (req) => {
  try {
    const url = new URL(req.url)
    const key = url.searchParams.get('key')

    if (!key) {
      return new Response('Missing key', { status: 400 })
    }

    const store = getStore('raffle')
    const file = await store.get(key, { type: 'stream' })

    if (!file) {
      return new Response('Not found', { status: 404 })
    }

    return new Response(file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${key}"`
      }
    })

  } catch (error) {
    return new Response('Error', { status: 500 })
  }
}
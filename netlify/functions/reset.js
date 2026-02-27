import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('raffle')
  await store.delete('numbers')
  return Response.json({ ok: true })
}

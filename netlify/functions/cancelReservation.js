import { getStore } from '@netlify/blobs'

export default async (req) => {
  const store = getStore('raffle')
  const { number, sessionId } = await req.json()

  const raw = await store.get('numbers')
  if (!raw) {
    return Response.json({ error: 'Numbers not initialized' }, { status: 400 })
  }

  const numbers = JSON.parse(raw)

  if (!numbers[number]) {
    return Response.json({ error: 'Number does not exist' }, { status: 400 })
  }

  const entry = numbers[number]

  // Solo liberar si está reservado por esta misma sesión
  if (entry.status !== 'reserved' || entry.sessionId !== sessionId) {
    return Response.json({ ok: true })
  }

  numbers[number] = { status: 'available' }
  await store.setJSON('numbers', numbers)
  await new Promise(resolve => setTimeout(resolve, 100))

  return Response.json({ ok: true })
}

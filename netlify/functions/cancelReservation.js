import { getStore } from '@netlify/blobs'

export default async (req) => {
  console.log('[cancelReservation] Función iniciada')

  const store = getStore('raffle')
  const body = await req.json()
  const { number, sessionId } = body
  console.log('[cancelReservation] Recibido:', { number, sessionId })

  const raw = await store.get('numbers')
  if (!raw) {
    console.log('[cancelReservation] ERROR: Numbers no inicializados')
    return Response.json({ error: 'Numbers not initialized' }, { status: 400 })
  }

  const numbers = JSON.parse(raw)
  console.log('[cancelReservation] Estado actual del número', number, ':', numbers[number])

  if (!numbers[number]) {
    console.log('[cancelReservation] ERROR: El número no existe')
    return Response.json({ error: 'Number does not exist' }, { status: 400 })
  }

  const entry = numbers[number]

  if (entry.status !== 'reserved') {
    console.log('[cancelReservation] El número no está reservado, status actual:', entry.status)
    return Response.json({ ok: true })
  }

  if (entry.sessionId !== sessionId) {
    console.log('[cancelReservation] SessionId no coincide. Esperado:', entry.sessionId, '| Recibido:', sessionId)
    return Response.json({ ok: true })
  }

  console.log('[cancelReservation] Liberando número', number)
  numbers[number] = { status: 'available' }
  await store.setJSON('numbers', numbers)
  await new Promise(resolve => setTimeout(resolve, 100))

  console.log('[cancelReservation] Número', number, 'liberado con éxito')
  return Response.json({ ok: true })
}

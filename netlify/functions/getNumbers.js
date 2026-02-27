import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('raffle')

  const raw = await store.get('numbers')

  if (!raw) {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }

  try {
    const numbers = JSON.parse(raw)
    const now = Date.now()
    const RESERVATION_TIME = 4 * 60 * 1000 // 4 minutos
    let needsUpdate = false

    // Limpiar reservas expiradas
    for (const [num, data] of Object.entries(numbers)) {
      if (data.status === 'reserved' && data.reservedAt) {
        if (now - data.reservedAt > RESERVATION_TIME) {
          numbers[num] = { status: 'available' }
          needsUpdate = true
        }
      }
    }

    // Si se liberó algún número, actualizar el store
    if (needsUpdate) {
      await store.setJSON('numbers', numbers)
    }

    return new Response(JSON.stringify(numbers), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (err) {
    console.error('PARSE ERROR', err)
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }
}

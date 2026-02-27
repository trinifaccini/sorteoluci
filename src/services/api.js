export async function fetchNumbers() {
    const res = await fetch('/.netlify/functions/numbers')
    if (!res.ok) throw new Error('Error cargando números')
    return res.json()
  }
  
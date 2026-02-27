import { useState } from 'react'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [numbers, setNumbers] = useState(null)
  const [error, setError] = useState(null)

  const login = async () => {
    setError(null)

    const res = await fetch('/.netlify/functions/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (!res.ok) {
      setError('Password incorrecta')
      return
    }

    const data = await res.json()
    setNumbers(data.numbers)
  }

  const exportCSV = () => {
    const taken = Object.entries(numbers)
      .filter(([_, data]) => data.status === 'taken')

    if (taken.length === 0) {
      alert('No hay números vendidos')
      return
    }

    let csv = 'Numero,Nombre,Email,Fecha\n'

    taken.forEach(([num, data]) => {
      csv += `${num},"${data.name}","${data.email}",${data.date}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'rifa_vendidos.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!numbers) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Panel Interno</h2>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Entrar</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    )
  }

  const vendidos = Object.entries(numbers)
    .filter(([_, data]) => data.status === 'taken')

  return (
    <div style={{ padding: 40 }}>
      <h2>Panel Interno</h2>

      <p><strong>Total vendidos:</strong> {vendidos.length}</p>

      <button onClick={exportCSV} style={{ marginBottom: 20 }}>
        Exportar CSV
      </button>

      {vendidos.map(([num, data]) => (
        <div key={num} style={{ borderBottom: '1px solid #ddd', padding: 10 }}>
          <p><strong>Número:</strong> {num}</p>
          <p><strong>Nombre:</strong> {data.name}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Fecha:</strong> {new Date(data.date).toLocaleString()}</p>

          {data.proofKey && (
            <a
              href={`/.netlify/functions/download?key=${data.proofKey}`}
              target="_blank"
              rel="noreferrer"
            >
              Descargar comprobante
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
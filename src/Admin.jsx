import { useState } from 'react'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [numbers, setNumbers] = useState(null)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 20

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
    .sort((a, b) => Number(a[0]) - Number(b[0]))

  const totalPages = Math.ceil(vendidos.length / ITEMS_PER_PAGE)

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedVendidos = vendidos.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  return (
    <div style={{ padding: 40 }}>
      <h2>Panel Interno</h2>

      <p><strong>Total vendidos:</strong> {vendidos.length}</p>

      <button onClick={exportCSV} style={{ marginBottom: 20 }}>
        Exportar CSV
      </button>

      {/* Paginación */}
      <div style={{ marginBottom: 20 }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          ← Anterior
        </button>

        <span style={{ margin: '0 10px' }}>
          Página {currentPage} de {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Siguiente →
        </button>
      </div>

      {paginatedVendidos.map(([num, data]) => (
        <div key={num} style={{ borderBottom: '1px solid #ddd', padding: 10 }}>
          <p><strong>Número:</strong> {num}</p>
          <p><strong>Nombre:</strong> {data.name}</p>
          <p><strong>Email:</strong> {data.email}</p>

          {data.proofKey && (
            <a
              href={`/.netlify/functions/download?key=${data.proofKey}`}
              target="_blank"
              rel="noreferrer"
            >
              Comprobante
            </a>
          )}
        </div>
      ))}

      {vendidos.length === 0 && (
        <p>No hay números vendidos todavía.</p>
      )}
    </div>
  )
}

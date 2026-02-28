import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NumberBoard from './components/NumberBoard'
import PurchaseModal from './components/PurchaseModal'
import SuccessMessage from './components/SuccessMessage'
import Admin from './Admin'
import Welcome from './Welcome'
import './App.css'

function Home() {
  const [takenNumbers, setTakenNumbers] = useState([])
  const [selectedNumber, setSelectedNumber] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successNumber, setSuccessNumber] = useState(null)

  // 👇 Session ID persistente por navegador
  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem('sessionId')
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36)
      sessionStorage.setItem('sessionId', id)
    }
    return id
  })

  const loadNumbers = async () => {
    try {
      const res = await fetch('/.netlify/functions/getNumbers')

      if (!res.ok) {
        throw new Error('Error loading numbers')
      }

      const data = await res.json()

      const taken = Object.entries(data)
        .filter(([, value]) =>
          value.status === 'taken' || value.status === 'reserved'
        )
        .map(([k]) => Number(k))

      setTakenNumbers(taken)

    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar los números')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNumbers()
    const interval = setInterval(loadNumbers, 30000)
    return () => clearInterval(interval)
  }, [])

  // ✅ RESERVAR
  const handleReserve = async (num) => {
    try {
      const res = await fetch('/.netlify/functions/reserveNumber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: num, sessionId }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'El número no está disponible')
        setSelectedNumber(null)
        loadNumbers()
        return
      }

      // Lo marcamos como tomado visualmente
      setTakenNumbers(prev => [...prev, num])

    } catch (err) {
      console.error('Error reservando:', err)
    }
  }

  // ✅ CANCELAR (espera backend antes de cerrar)
  const handleCancel = async () => {
    if (selectedNumber === null) return

    const numToCancel = selectedNumber

    try {
      const res = await fetch('/.netlify/functions/cancelReservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: numToCancel, sessionId }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Error cancelando la reserva')
        return
      }

      // Ahora sí actualizamos
      setTakenNumbers(prev => prev.filter(n => n !== numToCancel))
      setSelectedNumber(null)

      await loadNumbers()

    } catch (err) {
      console.error('Error cancelando reserva:', err)
      alert('Error de red cancelando la reserva')
    }
  }

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Cargando...</p>
  }

  if (error) {
    return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
  }

  return (
    <div className="app">
      <h1>Elegí tu número</h1>

      <div className="container">
        <NumberBoard
          takenNumbers={takenNumbers.filter(n => n !== selectedNumber)}
          onSelect={setSelectedNumber}
        />
      </div>

      {selectedNumber !== null && !showSuccess && (
        <PurchaseModal
          number={selectedNumber}
          sessionId={sessionId}
          onClose={() => setSelectedNumber(null)}
          onSuccess={() => {
            setSuccessNumber(selectedNumber)
            setSelectedNumber(null)
            setShowSuccess(true)
            loadNumbers()
          }}
          onCancel={handleCancel}
          onReserve={handleReserve}
        />
      )}

      {showSuccess && successNumber && (
        <SuccessMessage
          number={successNumber}
          onClose={() => {
            setShowSuccess(false)
            setSuccessNumber(null)
          }}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/rifa" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

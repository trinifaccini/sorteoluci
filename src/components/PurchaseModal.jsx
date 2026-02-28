import { useEffect, useState } from 'react'

export default function PurchaseModal({
  number,
  sessionId,
  onClose,
  onSuccess,
  onCancel,
  onReserve
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 👇 Reservamos apenas se abre el modal
  useEffect(() => {
    if (number !== null && onReserve) {
      onReserve(number)
    }
  }, [number])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !email || !file) {
      setError('Completá todos los campos y subí el comprobante')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('number', number)
      formData.append('name', name)
      formData.append('email', email)
      formData.append('file', file)
      formData.append('sessionId', sessionId)

      const res = await fetch('/.netlify/functions/submitRaffle', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error enviando formulario')
      }

      onSuccess()

    } catch (err) {
      console.error(err)
      setError(err.message || 'Error enviando formulario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Reservaste el número {number}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="modal-buttons">
            <button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Confirmar compra'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

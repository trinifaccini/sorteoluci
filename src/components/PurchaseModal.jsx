import { useState, useEffect, useRef } from 'react'

export default function PurchaseModal({ number, sessionId, onClose, onSuccess, onReserve }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [paymentProof, setPaymentProof] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(240)
  const timerRef = useRef(null)
  const submittedRef = useRef(false)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (onReserve) {
      onReserve(number)
    }
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          if (!submittedRef.current) {
            alert('Tu reserva expiró. Por favor, selecciona el número nuevamente.')
            if (onCloseRef.current) {
              onCloseRef.current()
            }
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos JPG, JPEG, PNG o PDF')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo debe ser menor a 5MB')
      return
    }

    setFileName(file.name)
    setShowPreview(false)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
      setPaymentProof(reader.result)
    }

    reader.readAsDataURL(file)
    setError(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/.netlify/functions/submitRaffle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number,
        name,
        email,
        paymentProof,
        sessionId
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error')
      setLoading(false)
      return
    }

    submittedRef.current = true
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    await onSuccess()
    setLoading(false)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const deletePreview = () => {
    setPaymentProof(null)
    setPreviewUrl(null)
    setFileName(null)
    setShowPreview(false)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Número {number}</h2>
        <h5>Transferí al alias: lucia.ferrari27</h5>

        <div className="reservation-timer">
          <span>
            ⏱️ Tiempo restante de reserva: {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>

        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div className="file-input-container">
            <label htmlFor="payment-proof" className="file-label">
              Subí tu comprobante de pago:
            </label>

            <div>

              <input
                id="payment-proof"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleImageChange}
                required
                className="file-input"
              />

            </div>

            {fileName && (
              <div className="actions-container">

                <button
                  type="button"
                  className="delete-button"
                  onClick={deletePreview}
                  aria-label="Borrar comprobante"
                  title="Borrar comprobante"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="file-toggle"
                  onClick={() => setShowPreview(prev => !prev)}
                >
                  {showPreview ? 'Ocultar comprobante' : 'Ver comprobante'}
                </button>



              </div>
            )}

            {showPreview && previewUrl && previewUrl.startsWith('data:image') && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}

            {showPreview && previewUrl && previewUrl.startsWith('data:application/pdf') && (
              <div className="pdf-preview">
                <iframe
                  src={previewUrl}
                  title="PDF Preview"
                  width="100%"
                  height="400px"
                />
              </div>
            )}
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-buttons">
            <button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Confirmar'}
            </button>

            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

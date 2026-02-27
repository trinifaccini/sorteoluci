import { useState, useEffect, useRef } from 'react'

export default function PurchaseModal({ number, sessionId, onClose, onSuccess, onReserve }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [paymentProof, setPaymentProof] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutos en segundos
  const timerRef = useRef(null)
  const submittedRef = useRef(false) // Flag para saber si ya se envió
  const onCloseRef = useRef(onClose) // Guardar onClose en ref

  // Actualizar la ref cuando onClose cambie
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Reservar el número al abrir el modal (solo una vez)
  useEffect(() => {
    if (onReserve) {
      onReserve(number)
    }
  }, []) // Solo al montar

  // Timer de countdown (separado, solo una vez)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          // Solo mostrar alert si NO se ha enviado el formulario
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
  }, []) // Solo al montar

  // AGREGAR función para manejar la imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB')
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
      setPaymentProof(reader.result) // guardar base64
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

    // Marcar como enviado y limpiar el timer antes de cerrar
    submittedRef.current = true
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    await onSuccess()
    setLoading(false)
  }

  // Formatear tiempo restante
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Número {number}</h2>

        <div className="reservation-timer">
          <span>⏱️ Tiempo restante de reserva: {minutes}:{seconds.toString().padStart(2, '0')}</span>
        </div>

        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Nombre"
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

          {/* Campo de imagen */}
          <div className="file-input-container">
            <label htmlFor="payment-proof" className="file-label">
              Comprobante de pago:
            </label>
            <input
              id="payment-proof"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="file-input"
            />

            {/* Preview de la imagen */}
            {previewUrl && (
              <div className="image-preview">
                <img
                  src={previewUrl}
                  alt="Preview"
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
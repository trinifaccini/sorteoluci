import { useState } from "react"
import { cancelReservation, submitRaffle } from "../services/api"

export default function PurchaseModal({
  selectedNumber,
  onClose,
  onReservationCancelled,
  onPurchaseSuccess,
}) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const handleCancel = async () => {
    try {
      setLoading(true)

      await cancelReservation(selectedNumber)

      // Avisamos al padre que se liberó el número
      if (onReservationCancelled) {
        onReservationCancelled(selectedNumber)
      }

      onClose()
    } catch (err) {
      console.error("Error cancelling reservation:", err)
      setError("No se pudo cancelar la reserva. Intentá nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !email || !file) {
      setError("Completá todos los campos y subí el comprobante.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("number", selectedNumber)
      formData.append("name", name)
      formData.append("email", email)
      formData.append("file", file)

      await submitRaffle(formData)

      if (onPurchaseSuccess) {
        onPurchaseSuccess(selectedNumber)
      }

      onClose()
    } catch (err) {
      console.error("Error submitting raffle:", err)
      setError("Hubo un error al enviar el formulario.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Número {selectedNumber}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {error && <p className="error">{error}</p>}

          <div className="modal-buttons">
            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Confirmar compra"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
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

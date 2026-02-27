import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="welcome">
      <h1>Sorteo Solidario</h1>

      <div className="welcome-card">
        <p>
          Estamos realizando este sorteo para apoyar una causa muy especial.
        </p>

        <p>
          Cada número es un paso más para cumplir un sueño 💛
        </p>

        <h3>¿Cómo participar?</h3>

        <ol>
          <li>Elegí tu número.</li>
          <li>Hacé la transferencia al alias indicado para comprar tu número.</li>
          <li>Subí tu comprobante.</li>
          <li>Recibí la confirmación por email :) </li>
        </ol>

        <button
          className="welcome-button"
          onClick={() => navigate('/rifa')}
        >
          Ver números disponibles
        </button>
      </div>
    </div>
  )
}

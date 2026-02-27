import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="welcome">
      <h1>Rifa Solidaria</h1>

      <div className="welcome-card">
        <p>
          Estamos realizando esta rifa para apoyar una causa muy especial.
        </p>

        <p>
          Cada número comprado nos ayuda a acercarnos a nuestro objetivo.
        </p>

        <h3>¿Cómo participar?</h3>

        <ol>
          <li>Elegí tu número.</li>
          <li>Realizá el pago.</li>
          <li>Subí tu comprobante.</li>
          <li>Recibí la confirmación por email.</li>
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
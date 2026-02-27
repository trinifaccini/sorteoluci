export default function SuccessMessage({ number, onClose }) {
    return (
      <div className="modal-backdrop">
        <div className="modal success-modal">          
          <h2 className="success-title">
            ¡Recibimos tu comprobante!
          </h2>
          
          <div className="success-number">
            <p>Tu número</p>
            <span className="number-badge">{number}</span>
            <p>está reservado</p>
          </div>
          
          <p className="success-message">
            Gracias por participar en la rifa.
            <br />
            Te enviaremos una confirmación por email.
          </p>
          
          <button 
            onClick={onClose}
            className="success-button"
            type="button"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }
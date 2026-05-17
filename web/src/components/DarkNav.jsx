import { useNavigate } from 'react-router-dom'

const ShieldIcon = () => (
  <svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 0L0 4.5V12.5C0 19.1 4.9 25.3 11 26C17.1 25.3 22 19.1 22 12.5V4.5L11 0Z"
      fill="#22C55E"
    />
    <path
      d="M9.5 17.5L5.5 13.5L6.9 12.1L9.5 14.7L15.1 9.1L16.5 10.5L9.5 17.5Z"
      fill="#0A0A0A"
    />
  </svg>
)

export default function DarkNav({ showCta = true }) {
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '60px',
      backgroundColor: '#0A0A0A',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <ShieldIcon />
        <span style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '1.2rem',
          fontWeight: 600,
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
        }}>
          BillShield
        </span>
      </button>

      {showCta && (
        <button
          onClick={() => navigate('/upload')}
          style={{
            backgroundColor: '#22C55E',
            color: '#0A0A0A',
            fontFamily: "'Satoshi', sans-serif",
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '8px 20px',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          Audit my bill →
        </button>
      )}
    </nav>
  )
}

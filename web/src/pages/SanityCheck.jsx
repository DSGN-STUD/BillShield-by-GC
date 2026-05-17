import { useNavigate } from 'react-router-dom'
import LightNav from '../components/LightNav'
import { mockSanityItems } from '../data/mockData'

const confidenceStyle = {
  HIGH: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  MEDIUM: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  LOW: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
}

function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN')
}

export default function SanityCheck() {
  const navigate = useNavigate()

  const backLink = (
    <button
      onClick={() => navigate('/upload')}
      style={{
        background: 'none',
        border: 'none',
        fontFamily: "'Satoshi', sans-serif",
        fontSize: '0.875rem',
        color: '#6B6860',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      ← Back
    </button>
  )

  return (
    <div style={{ backgroundColor: '#F0EEE8', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sanity-content {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .row-hover:hover {
          background-color: #F5F3EE !important;
        }
        .confirm-btn:hover {
          background-color: #2D2D2D !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.22) !important;
          transform: translateY(-1px) !important;
        }
        .wrong-link:hover {
          text-decoration: underline !important;
        }
      `}</style>

      <LightNav rightContent={backLink} />

      <div
        className="sanity-content"
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '48px 24px 80px 24px',
        }}
      >
        {/* Label */}
        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.7rem',
          color: '#6B6860',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          Review Extracted Items
        </p>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '2rem',
          fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: '10px',
          letterSpacing: '-0.02em',
        }}>
          We extracted {mockSanityItems.length} items from your bill.
        </h1>

        {/* Subhead */}
        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.95rem',
          color: '#6B6860',
          marginBottom: '20px',
          lineHeight: 1.55,
        }}>
          Confirm these match your bill before we analyse.
        </p>

        {/* Privacy Note */}
        <div style={{
          backgroundColor: 'rgba(220,38,38,0.06)',
          border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '0.9rem' }}>🔒</span>
          <p style={{
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '0.8rem',
            color: '#6B6860',
            margin: 0,
            lineHeight: 1.5,
          }}>
            Patient identity and Aadhaar have been redacted and are not shown here.
          </p>
        </div>

        {/* Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #D8D5CC',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '28px',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 110px',
            backgroundColor: '#F0EEE8',
            padding: '12px 20px',
            borderBottom: '1px solid #E8E6DF',
          }}>
            {['Item Description', 'Billed Amount', 'Confidence'].map((col, i) => (
              <p key={col} style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: '0.72rem',
                color: '#6B6860',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: 0,
                textAlign: i === 1 ? 'right' : i === 2 ? 'center' : 'left',
              }}>
                {col}
              </p>
            ))}
          </div>

          {/* Rows */}
          {mockSanityItems.map((item, i) => (
            <div
              key={item.id}
              className="row-hover"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px 110px',
                padding: '14px 20px',
                borderBottom: i < mockSanityItems.length - 1 ? '1px solid #E8E6DF' : 'none',
                backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAF7',
                alignItems: 'center',
                transition: 'background-color 0.15s',
              }}
            >
              <p style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: '0.875rem',
                color: '#1A1A1A',
                margin: 0,
                lineHeight: 1.45,
              }}>
                {item.description}
              </p>

              <p style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#1A1A1A',
                margin: 0,
                textAlign: 'right',
              }}>
                {formatINR(item.billed)}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  ...confidenceStyle[item.confidence],
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}>
                  {item.confidence}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}>
          <button
            className="confirm-btn"
            onClick={() => navigate('/results')}
            style={{
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '12px 32px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
            }}
          >
            Confirm &amp; Analyse →
          </button>

          <button
            className="wrong-link"
            onClick={() => navigate('/upload')}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: "'Satoshi', sans-serif",
              fontSize: '0.9rem',
              color: '#DC2626',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'text-decoration 0.1s',
            }}
          >
            Something looks wrong
          </button>
        </div>
      </div>
    </div>
  )
}

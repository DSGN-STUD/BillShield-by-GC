import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LightNav from '../components/LightNav'

const confidenceStyle = {
  HIGH: { backgroundColor: '#DCFCE7', color: '#166534' },
  MEDIUM: { backgroundColor: '#FEF3C7', color: '#92400E' },
  LOW: { backgroundColor: '#FEE2E2', color: '#991B1B' },
}

function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

export default function SanityCheck() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [dismissed, setDismissed] = useState(new Set())

  useEffect(() => {
    const extracted = JSON.parse(sessionStorage.getItem('extracted') || 'null')
    if (!extracted) { navigate('/upload'); return }
    setItems(extracted.line_items || [])
  }, [navigate])

  const visible = items.filter((_, i) => !dismissed.has(i))
  const totalVisible = visible.reduce((sum, it) => sum + (it.total || 0), 0)

  return (
    <div style={{ backgroundColor: '#F0EEE8', minHeight: '100vh', paddingBottom: '100px' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sanity-content { animation: fadeInUp 0.5s ease-out forwards; }
        .dismiss-btn:hover { background-color: #FEE2E2 !important; color: #991B1B !important; }
        .confirm-btn:hover { background-color: #1A1A1A !important; }
        .back-btn:hover { color: #1A1A1A !important; }
      `}</style>

      <LightNav />

      <div
        className="sanity-content"
        style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px 0' }}
      >
        {/* Back */}
        <button
          className="back-btn"
          onClick={() => navigate('/upload')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '0.875rem',
            color: '#6B6860',
            cursor: 'pointer',
            marginBottom: '28px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'color 0.15s',
          }}
        >
          ← Back
        </button>

        {/* Header */}
        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.68rem',
          fontWeight: 500,
          color: '#6B6860',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: '0 0 12px 0',
        }}>
          Step 2 of 3 — Verify Extraction
        </p>

        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
          fontWeight: 700,
          color: '#1A1A1A',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 0 10px 0',
        }}>
          Do these look right?
        </h1>
        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.95rem',
          color: '#6B6860',
          margin: '0 0 36px 0',
          lineHeight: 1.55,
        }}>
          We extracted {items.length} line items from your bill. Remove any that look incorrect, then confirm to continue.
        </p>

        {/* Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #D8D5CC',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 100px 48px',
            gap: '0',
            padding: '10px 20px',
            backgroundColor: '#F7F5EF',
            borderBottom: '1px solid #E8E6DF',
          }}>
            {['Description', 'Amount', 'Confidence', ''].map((h) => (
              <span key={h} style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#6B6860',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {items.map((item, i) => {
            if (dismissed.has(i)) return null
            const cs = confidenceStyle[item.confidence] || confidenceStyle.LOW
            return (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 100px 48px',
                  gap: '0',
                  padding: '14px 20px',
                  borderBottom: '1px solid #F0EDE6',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.875rem',
                  color: '#1A1A1A',
                  paddingRight: '12px',
                }}>
                  {item.item_name}
                  {item.quantity && item.quantity > 1 && (
                    <span style={{ color: '#6B6860', marginLeft: '6px', fontSize: '0.8rem' }}>
                      × {item.quantity}
                    </span>
                  )}
                </span>
                <span style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#1A1A1A',
                }}>
                  {formatINR(item.total)}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: cs.backgroundColor,
                  color: cs.color,
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  width: 'fit-content',
                }}>
                  {item.confidence}
                </span>
                <button
                  className="dismiss-btn"
                  onClick={() => setDismissed(prev => new Set([...prev, i]))}
                  title="Remove this item"
                  style={{
                    background: 'none',
                    border: '1px solid #E8E6DF',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontFamily: "'Satoshi', sans-serif",
                    fontSize: '1rem',
                    color: '#6B6860',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            )
          })}

          {/* Totals footer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 100px 48px',
            gap: '0',
            padding: '14px 20px',
            backgroundColor: '#F7F5EF',
            borderTop: '1px solid #E8E6DF',
          }}>
            <span style={{
              fontFamily: "'Satoshi', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#1A1A1A',
            }}>
              {visible.length} item{visible.length !== 1 ? 's' : ''}
            </span>
            <span style={{
              fontFamily: "'Satoshi', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#1A1A1A',
            }}>
              {formatINR(totalVisible)}
            </span>
            <span /><span />
          </div>
        </div>

        {dismissed.size > 0 && (
          <p style={{
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '0.8rem',
            color: '#6B6860',
            marginTop: '12px',
            fontStyle: 'italic',
          }}>
            {dismissed.size} item{dismissed.size !== 1 ? 's' : ''} removed from analysis.
          </p>
        )}
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0A0A0A',
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.6)',
          margin: 0,
        }}>
          Confirm these {visible.length} items to see your audit results.
        </p>
        <button
          className="confirm-btn"
          onClick={() => navigate('/results')}
          style={{
            backgroundColor: '#22C55E',
            color: '#0A0A0A',
            fontFamily: "'Satoshi', sans-serif",
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '10px 28px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            flexShrink: 0,
          }}
        >
          Looks correct →
        </button>
      </div>
    </div>
  )
}

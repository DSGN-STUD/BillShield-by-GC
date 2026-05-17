import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LightNav from '../components/LightNav'

const API = 'http://localhost:5000'

function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

const violationStyles = {
  STRUCTURAL_VIOLATION: {
    backgroundColor: '#FDF2F8',
    color: '#9D174D',
    borderColor: '#FBCFE8',
    label: 'STRUCTURAL VIOLATION',
  },
  RATE_OVERCHARGE: {
    backgroundColor: '#FFF7ED',
    color: '#9A3412',
    borderColor: '#FED7AA',
    label: 'RATE VIOLATION',
  },
  // legacy key kept in case mock data is ever used
  RATE_VIOLATION: {
    backgroundColor: '#FFF7ED',
    color: '#9A3412',
    borderColor: '#FED7AA',
    label: 'RATE VIOLATION',
  },
}

function buildExplanation(flag) {
  if (flag.flag_type === 'STRUCTURAL_VIOLATION') {
    return `${flag.item_name} cannot be billed separately — it is bundled per CGHS Annexure-III.`
  }
  const mult = flag.multiplier ? flag.multiplier.toFixed(1) + '×' : ''
  return `Billed at ${formatINR(flag.billed_amount)} — ${mult} the CGHS benchmark of ${formatINR(flag.cghs_rate)} (${flag.cghs_code || ''}).`
}

function FlagCard({ flag }) {
  const type = flag.flag_type || flag.type
  const vs = violationStyles[type] || violationStyles.RATE_OVERCHARGE
  const billed = flag.billed_amount ?? flag.billed
  const expected = flag.cghs_rate ?? flag.expected
  const overcharge = flag.delta ?? flag.overcharge
  const item = flag.item_name || flag.item
  const explanation = flag.explanation || buildExplanation(flag)

  return (
    <div className="flag-card" style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #D8D5CC',
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '12px',
      display: 'flex',
      gap: '24px',
      alignItems: 'flex-start',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          backgroundColor: vs.backgroundColor,
          color: vs.color,
          border: `1px solid ${vs.borderColor}`,
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '3px 10px',
          borderRadius: '9999px',
          display: 'inline-block',
        }}>
          {vs.label}
        </span>

        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#1A1A1A',
          margin: '8px 0 4px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}>
          {item}
        </p>

        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.85rem',
          color: '#6B6860',
          margin: '0 0 6px 0',
          lineHeight: 1.55,
        }}>
          {explanation}
        </p>

        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.75rem',
          color: 'rgba(107,104,96,0.7)',
          fontStyle: 'italic',
          margin: 0,
        }}>
          {flag.citation}
        </p>
      </div>

      <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '160px' }}>
        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.85rem',
          color: '#6B6860',
          textDecoration: 'line-through',
          margin: '0 0 4px 0',
        }}>
          Billed: {formatINR(billed)}
        </p>

        {expected > 0 && (
          <p style={{
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#DC2626',
            margin: '0 0 6px 0',
          }}>
            Expected {formatINR(expected)}
          </p>
        )}

        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.75rem',
          fontWeight: 500,
          color: '#DC2626',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin: 0,
        }}>
          Overcharged by {formatINR(overcharge)}
        </p>
      </div>
    </div>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [generatingLetter, setGeneratingLetter] = useState(false)
  const [letterError, setLetterError] = useState(null)

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('analysis') || 'null')
    if (!data) { navigate('/upload'); return }
    setAnalysis(data)
  }, [navigate])

  const handleGenerateLetter = async () => {
    if (generatingLetter) return
    setGeneratingLetter(true)
    setLetterError(null)
    try {
      const extracted = JSON.parse(sessionStorage.getItem('extracted') || 'null')
      const res = await fetch(`${API}/api/letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, extracted }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Letter generation failed')
      sessionStorage.setItem('letter', data.letter)
      navigate('/letter')
    } catch (err) {
      setLetterError(err.message)
      setGeneratingLetter(false)
    }
  }

  if (!analysis) return null

  const flags = analysis.flags || []
  const totalFlagged = analysis.total_flagged_amount || 0
  const letterWarranted = analysis.letter_warranted !== false

  const auditLink = (
    <button
      className="audit-link-btn"
      onClick={() => navigate('/upload')}
      style={{
        background: 'none',
        border: '1px solid #D8D5CC',
        fontFamily: "'Satoshi', sans-serif",
        fontSize: '0.875rem',
        color: '#1A1A1A',
        cursor: 'pointer',
        padding: '7px 16px',
        borderRadius: '8px',
        transition: 'background 0.15s',
      }}
    >
      Audit another bill
    </button>
  )

  return (
    <div style={{ backgroundColor: '#F0EEE8', minHeight: '100vh', paddingBottom: '80px' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .results-content { animation: fadeInUp 0.5s ease-out forwards; }
        .flag-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .gen-letter-btn:hover { background-color: #B91C1C !important; }
        .audit-link-btn:hover { background-color: #E8E6DF !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 8px;
        }
      `}</style>

      <LightNav rightContent={auditLink} />

      <div
        className="results-content"
        style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 0 24px' }}
      >
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '32px',
          alignItems: 'center',
          marginBottom: '52px',
        }}>
          <div>
            <p style={{
              fontFamily: "'Satoshi', sans-serif",
              fontSize: '0.68rem',
              fontWeight: 500,
              color: '#6B6860',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: '0 0 12px 0',
            }}>
              AUDIT COMPLETE
            </p>
            <h1 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 800,
              color: '#1A1A1A',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: '0 0 14px 0',
            }}>
              Audit Complete.
            </h1>
            <p style={{
              fontFamily: "'Satoshi', sans-serif",
              fontSize: '1rem',
              color: '#6B6860',
              lineHeight: 1.6,
              margin: 0,
            }}>
              {flags.length > 0
                ? `We found ${flags.length} issue${flags.length !== 1 ? 's' : ''} totalling ${formatINR(totalFlagged)}.`
                : 'No overcharges found. Your bill looks clean.'}
            </p>
          </div>

          {totalFlagged > 0 && (
            <div style={{
              backgroundColor: '#DC2626',
              borderRadius: '16px',
              padding: '28px 36px',
              minWidth: '210px',
              flexShrink: 0,
            }}>
              <p style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                margin: '0 0 10px 0',
              }}>
                POTENTIAL SAVINGS
              </p>
              <p style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: 1,
              }}>
                {formatINR(totalFlagged)}
              </p>
            </div>
          )}
        </div>

        {/* Flags */}
        {flags.length > 0 && (
          <>
            <p style={{
              fontFamily: "'Satoshi', sans-serif",
              fontSize: '0.7rem',
              fontWeight: 500,
              color: '#6B6860',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              Flagged Items
            </p>
            {flags.map((flag, i) => <FlagCard key={i} flag={flag} />)}
          </>
        )}

        {/* Sub-threshold note */}
        {!letterWarranted && analysis.letter_threshold_note && (
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '10px',
            padding: '16px 20px',
            marginTop: '24px',
          }}>
            <p style={{
              fontFamily: "'Satoshi', sans-serif",
              fontSize: '0.875rem',
              color: '#92400E',
              margin: 0,
            }}>
              {analysis.letter_threshold_note}
            </p>
          </div>
        )}
      </div>

      {/* Sticky bottom bar — only if letter warranted */}
      {letterWarranted && flags.length > 0 && (
        <div style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#0A0A0A',
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div>
            <p style={{
              fontFamily: "'Satoshi', sans-serif",
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
            }}>
              Generate a formal dispute letter based on these findings.
            </p>
            {letterError && (
              <p style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: '0.8rem',
                color: '#F87171',
                margin: '4px 0 0 0',
              }}>
                {letterError}
              </p>
            )}
          </div>
          <button
            className="gen-letter-btn"
            onClick={handleGenerateLetter}
            disabled={generatingLetter}
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: generatingLetter ? 'not-allowed' : 'pointer',
              opacity: generatingLetter ? 0.8 : 1,
              transition: 'background-color 0.2s',
              flexShrink: 0,
              letterSpacing: '0.01em',
            }}
          >
            {generatingLetter
              ? <><span className="btn-spinner" />Generating…</>
              : 'Generate Dispute Letter →'
            }
          </button>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LightNav from '../components/LightNav'

const steps = [
  { label: 'Extracting items from bill...', startAt: 0 },
  { label: 'Comparing against CGHS/NPPA rates...', startAt: 3000 },
  { label: 'Checking IRDAI compliance...', startAt: 6000 },
  { label: 'Flagging structural violations...', startAt: 9000 },
]

const STEP_DURATION = 3000
const NAVIGATE_AT = 13000

function Spinner() {
  return (
    <div style={{
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      border: '2px solid rgba(220,38,38,0.2)',
      borderTopColor: '#DC2626',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

function CheckMark() {
  return (
    <div style={{
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: '#22C55E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function DocIcon({ completed }) {
  const color = completed ? '#22C55E' : '#DC2626'
  const bg = completed ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)'
  return (
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      backgroundColor: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'background-color 0.3s ease',
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="10" height="13" rx="1.5" stroke={color} strokeWidth="1.5" />
        <path d="M4 5h6M4 8h6M4 11h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function StepCard({ step, elapsed }) {
  const started = elapsed >= step.startAt
  const progress = started
    ? Math.min(100, ((elapsed - step.startAt) / STEP_DURATION) * 100)
    : 0
  const completed = progress >= 100
  const active = started && !completed

  if (!started) return null

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: `1px solid ${completed ? '#D8D5CC' : 'rgba(220,38,38,0.25)'}`,
      borderLeft: `3px solid ${completed ? '#22C55E' : '#DC2626'}`,
      borderRadius: '10px',
      padding: '16px 20px',
      width: '100%',
      animation: 'stepFadeIn 0.4s ease-out forwards',
      opacity: 0,
      boxShadow: active ? '0 4px 20px rgba(0,0,0,0.07)' : 'none',
      transition: 'box-shadow 0.3s ease',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: active ? '12px' : 0,
      }}>
        <DocIcon completed={completed} />
        <span style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.9rem',
          fontWeight: 500,
          color: completed ? '#6B6860' : '#1A1A1A',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {step.label}
          {active && (
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#DC2626',
              animation: 'pulseDot 1.2s ease-in-out infinite',
              display: 'inline-block',
              flexShrink: 0,
            }} />
          )}
        </span>
        {completed ? <CheckMark /> : <Spinner />}
      </div>

      {active && (
        <div style={{
          height: '3px',
          backgroundColor: 'rgba(220,38,38,0.1)',
          borderRadius: '99px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#DC2626',
            borderRadius: '99px',
            transition: 'width 0.1s linear',
          }} />
        </div>
      )}
    </div>
  )
}

export default function Processing() {
  const navigate = useNavigate()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const now = Date.now() - start
      setElapsed(now)
      if (now >= NAVIGATE_AT) {
        clearInterval(interval)
        navigate('/sanity-check')
      }
    }, 50)
    return () => clearInterval(interval)
  }, [navigate])

  return (
    <div style={{ backgroundColor: '#F0EEE8', minHeight: '100vh' }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes stepFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.7); }
        }
        .processing-content {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>

      <LightNav />

      <div
        className="processing-content"
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: '80px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '2rem',
          fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: '8px',
          textAlign: 'center',
          letterSpacing: '-0.02em',
        }}>
          Auditing your bill...
        </h1>
        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.875rem',
          color: '#6B6860',
          marginBottom: '40px',
          textAlign: 'center',
        }}>
          This usually takes 20–30 seconds
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
        }}>
          {steps.map((step, i) => (
            <StepCard key={i} step={step} elapsed={elapsed} />
          ))}
        </div>

        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontStyle: 'italic',
          fontSize: '0.8rem',
          color: '#6B6860',
          textAlign: 'center',
          marginTop: '40px',
          lineHeight: 1.5,
        }}>
          Redacting PII and verifying against 12,000+ rate entries...
        </p>
      </div>
    </div>
  )
}

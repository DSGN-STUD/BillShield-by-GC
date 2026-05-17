import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LightNav from '../components/LightNav'
import { mockLetter } from '../data/mockData'

export default function Letter() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mockLetter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for environments without clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = mockLetter
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSavePdf = () => {
    window.print()
  }

  return (
    <div style={{ backgroundColor: '#F0EEE8', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .letter-content {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .copy-btn:hover {
          background-color: #E8E6DF !important;
        }
        .pdf-btn:hover {
          background-color: #2D2D2D !important;
        }
        .back-link:hover {
          opacity: 0.75;
        }

        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; }
          .letter-doc { border: none !important; box-shadow: none !important; }
        }
      `}</style>

      <LightNav />

      <div
        className="letter-content"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '48px 24px 80px 24px',
        }}
      >
        {/* Back Link */}
        <button
          className="back-link"
          onClick={() => navigate('/upload')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '0.875rem',
            color: '#DC2626',
            cursor: 'pointer',
            marginBottom: '32px',
            display: 'block',
            padding: 0,
            transition: 'opacity 0.2s',
          }}
        >
          ← Audit another bill
        </button>

        {/* Heading Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Your Dispute Letter
          </h1>

          <div className="no-print" style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button
              className="copy-btn"
              onClick={handleCopy}
              style={{
                border: '1px solid #D8D5CC',
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A',
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                minWidth: '110px',
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Letter'}
            </button>

            <button
              className="pdf-btn"
              onClick={handleSavePdf}
              style={{
                backgroundColor: '#1A1A1A',
                color: '#FFFFFF',
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
            >
              Save as PDF
            </button>
          </div>
        </div>

        {/* Letter Document */}
        <div
          className="letter-doc"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #D8D5CC',
            borderRadius: '12px',
            padding: '48px 52px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '0.9rem',
            lineHeight: 1.8,
            color: '#1A1A1A',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {mockLetter}
        </div>

        {/* Legal Disclaimer */}
        <div
          className="no-print"
          style={{
            backgroundColor: '#1A1A1A',
            borderRadius: '10px',
            padding: '20px 24px',
            marginTop: '20px',
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(220,38,38,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '1rem',
          }}>
            <span style={{ color: '#DC2626' }}>⚠</span>
          </div>

          <p style={{
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.65)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            This letter is an AI-generated draft based on Indian health regulations. Please review all dates, amounts and patient details before sending.
          </p>
        </div>
      </div>
    </div>
  )
}

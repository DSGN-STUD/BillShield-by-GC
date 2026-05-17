import { useNavigate } from 'react-router-dom'
import DarkNav from '../components/DarkNav'

const testimonials = [
  {
    quote: "They billed me ₹16,980 for an MRI. The CGHS rate is ₹2,750.",
    attribution: "Ramesh, Bengaluru",
    position: { top: '10%', left: '2%' },
    delay: '0.2s',
  },
  {
    quote: "₹1,35,820 billed. Insurance rejected it three times. I had no data to argue back.",
    attribution: "Priya, Hyderabad",
    position: { top: '10%', right: '2%' },
    delay: '0.5s',
  },
  {
    quote: "The billing desk laughed when I asked why it was so much.",
    attribution: "Suresh, Lucknow",
    position: { bottom: '10%', left: '2%' },
    delay: '0.8s',
  },
  {
    quote: "Settlement has been pending for a month. They keep asking for new documents.",
    attribution: "Meera, Chennai",
    position: { bottom: '10%', right: '2%' },
    delay: '1.1s',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', color: '#FFFFFF' }}>
      <style>{`
        @keyframes fadeInCard {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 0.9; transform: translateY(0); }
        }
        @keyframes fadeInHero {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-content {
          animation: fadeInHero 0.8s ease-out forwards;
        }
        .testimonial-card {
          animation: fadeInCard 0.6s ease-out forwards;
          opacity: 0;
        }
        .cta-primary:hover {
          background-color: #16A34A !important;
        }
        .cta-secondary:hover {
          border-color: rgba(255,255,255,0.5) !important;
          background-color: rgba(255,255,255,0.05) !important;
        }
        .step-card:hover {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.12) !important;
        }
      `}</style>

      <DarkNav showCta={true} />

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        overflow: 'hidden',
      }}>

        {/* Floating Testimonial Cards */}
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="testimonial-card"
            style={{
              position: 'absolute',
              ...t.position,
              maxWidth: '220px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '16px 20px',
              animationDelay: t.delay,
              animationFillMode: 'forwards',
            }}
          >
            <p style={{
              fontFamily: "'Sora', sans-serif",
              fontStyle: 'italic',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.55,
              margin: 0,
            }}>
              "{t.quote}"
            </p>
            <p style={{
              fontFamily: "'Satoshi', sans-serif",
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.3)',
              marginTop: '8px',
              margin: '8px 0 0 0',
            }}>
              — {t.attribution}
            </p>
          </div>
        ))}

        {/* Hero Content */}
        <div className="hero-content" style={{
          textAlign: 'center',
          maxWidth: '600px',
          position: 'relative',
          zIndex: 1,
        }}>
          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            color: '#FFFFFF',
            margin: '0 0 28px 0',
            letterSpacing: '-0.02em',
          }}>
            Your hospital bill
            <br />
            deserves{' '}
            <em style={{ color: '#22C55E', fontStyle: 'italic' }}>a second opinion.</em>
          </h1>

          {/* Thin HR */}
          <div style={{
            width: '60px',
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            margin: '0 auto 24px auto',
          }} />

          <p style={{
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.65,
            maxWidth: '480px',
            margin: '0 auto 36px auto',
          }}>
            BillShield checks every line against verified CGHS, NPPA and IRDAI benchmarks — and writes a formal dispute letter you can send in 14 days.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              className="cta-primary"
              onClick={() => navigate('/upload')}
              style={{
                backgroundColor: '#22C55E',
                color: '#0A0A0A',
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '14px 32px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                letterSpacing: '0.01em',
              }}
            >
              Audit my bill →
            </button>
            <button
              className="cta-secondary"
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '14px 32px',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              How it works
            </button>
          </div>

          {/* Regulatory Citations */}
          <p style={{
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.05em',
            marginTop: '48px',
            textTransform: 'uppercase',
          }}>
            CGHS OM 03.10.2025 · NPPA 30.01.2026 · IRDAI Master Circular 29.05.2024
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        style={{
          padding: '100px 24px',
          maxWidth: '960px',
          margin: '0 auto',
        }}
      >
        <p style={{
          fontFamily: "'Satoshi', sans-serif",
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.3)',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          How It Works
        </p>

        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(2rem, 4vw, 2.8rem)',
          fontWeight: 600,
          color: '#FFFFFF',
          lineHeight: 1.1,
          textAlign: 'center',
          marginBottom: '56px',
        }}>
          Three steps.{' '}
          <em style={{ color: '#22C55E', fontStyle: 'italic' }}>Two minutes.</em>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
        }}>
          {[
            {
              num: '01',
              title: 'Upload the bill',
              desc: 'PDF, JPG, or PNG. Your data is processed securely and never stored.',
            },
            {
              num: '02',
              title: 'Line-by-line audit',
              desc: 'Every charge is compared against CGHS, NPPA and IRDAI benchmarks.',
            },
            {
              num: '03',
              title: 'Dispute letter',
              desc: 'A formal letter citing the exact regulations — ready to send in 14 days.',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="step-card"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '32px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '3rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.08)',
                lineHeight: 1,
                marginBottom: '20px',
              }}>
                {step.num}
              </div>
              <h3 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: '10px',
                margin: '0 0 10px 0',
              }}>
                {step.title}
              </h3>
              <p style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.6,
                margin: 0,
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

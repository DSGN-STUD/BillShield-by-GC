import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DarkNav from '../components/DarkNav'

const API = 'http://localhost:5000'

const CloudUploadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.3 28.3C10.2 28.3 7.5 26.1 7.5 22.8C7.5 19.8 9.7 17.4 12.6 17.1C12.6 17 12.5 16.9 12.5 16.7C12.5 12.5 15.9 9.2 20 9.2C23.7 9.2 26.8 11.8 27.4 15.3C30.4 15.6 32.5 18.1 32.5 20.8C32.5 24.2 29.7 26.7 26.7 26.7"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 25L20 21L24 25"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 21V33"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function Upload() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(f.type) && !f.name.match(/\.(pdf|jpg|jpeg|png)$/i)) return
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.')
      return
    }
    setError(null)
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleAnalyse = async () => {
    if (!file || loading) return
    setLoading(true)
    setError(null)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API}/api/upload`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      if (data.status === 'extraction_failed') throw new Error(data.reason || 'Could not read bill')
      sessionStorage.setItem('extracted', JSON.stringify(data))
      navigate('/processing')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const dropzoneBorder = file
    ? '2px dashed rgba(34,197,94,0.6)'
    : isDragging
    ? '2px dashed rgba(34,197,94,0.4)'
    : '2px dashed rgba(255,255,255,0.15)'

  const dropzoneBg = file
    ? 'rgba(34,197,94,0.05)'
    : isDragging
    ? 'rgba(34,197,94,0.03)'
    : 'transparent'

  const btnActive = file && !loading

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', color: '#FFFFFF' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .upload-content { animation: fadeInUp 0.5s ease-out forwards; }
        .change-link:hover { color: rgba(255,255,255,0.8) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(10,10,10,0.3);
          border-top-color: #0A0A0A;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 8px;
        }
      `}</style>

      <DarkNav showCta={false} />

      <div
        className="upload-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 60px)',
          padding: '48px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <p style={{
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.3)',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            Step 1 of 3
          </p>

          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '2.8rem',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.05,
            textAlign: 'center',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}>
            Know what you owe.
          </h1>

          <p style={{
            fontFamily: "'Satoshi', sans-serif",
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: '420px',
            margin: '0 auto 36px auto',
          }}>
            Upload your hospital bill. We check every line against verified government rates.
          </p>

          {/* Dropzone */}
          <div
            onClick={() => !loading && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            style={{
              border: dropzoneBorder,
              borderRadius: '16px',
              backgroundColor: dropzoneBg,
              padding: '48px 32px',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {file ? (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(34,197,94,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  fontSize: '1.4rem',
                }}>
                  ✓
                </div>
                <p style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#22C55E',
                  marginBottom: '4px',
                }}>
                  {file.name}
                </p>
                <p style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '16px',
                }}>
                  {formatFileSize(file.size)}
                </p>
                {!loading && (
                  <button
                    className="change-link"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      setError(null)
                      inputRef.current.value = ''
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontFamily: "'Satoshi', sans-serif",
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      transition: 'color 0.2s',
                    }}
                  >
                    Change file
                  </button>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '16px' }}>
                  <CloudUploadIcon />
                </div>
                <p style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  marginBottom: '6px',
                }}>
                  Drop your bill here
                </p>
                <p style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '16px',
                }}>
                  or click to browse
                </p>
                <p style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.25)',
                }}>
                  PDF, JPG, PNG · Max 10 MB
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p style={{
              fontFamily: "'Satoshi', sans-serif",
              fontSize: '0.85rem',
              color: '#F87171',
              marginTop: '12px',
              textAlign: 'center',
            }}>
              {error}
            </p>
          )}

          {/* Analyse Button */}
          <button
            onClick={handleAnalyse}
            disabled={!btnActive}
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '14px 0',
              borderRadius: '12px',
              border: 'none',
              fontFamily: "'Satoshi', sans-serif",
              fontWeight: btnActive ? 700 : 400,
              fontSize: '1rem',
              cursor: btnActive ? 'pointer' : 'not-allowed',
              backgroundColor: btnActive ? '#22C55E' : 'rgba(255,255,255,0.08)',
              color: btnActive ? '#0A0A0A' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
            }}
          >
            {loading
              ? <><span className="btn-spinner" />Extracting bill…</>
              : file ? 'Analyse Bill →' : 'Analyse Bill'
            }
          </button>

          {/* Trust Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '28px',
            flexWrap: 'wrap',
          }}>
            {['✓ Verified CGHS rates', '✓ No login required', '✓ Your data never stored'].map((badge) => (
              <span
                key={badge}
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

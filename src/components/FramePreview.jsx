import { useRef, useCallback, useEffect, useState } from 'react'

// Header/footer: sky-blue at 52% opacity, overlaid on the photo
const OVERLAY_BG = 'rgba(135,206,235,0.52)'
const ACCENT_YELLOW = '#f5c518'

const DefaultSeal1 = () => (
  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="23" fill="#e8f4fb" stroke="#1a7bb5" strokeWidth="1.5"/>
    <circle cx="25" cy="25" r="16" fill="none" stroke="#1a7bb5" strokeWidth="0.8" strokeDasharray="2 2"/>
    <text x="25" y="20" textAnchor="middle" fill="#0a5a8a" fontSize="5.5" fontWeight="700" fontFamily="Arial">MUNICIPALITY</text>
    <text x="25" y="28" textAnchor="middle" fill="#0a5a8a" fontSize="7" fontWeight="900" fontFamily="Arial">BASUD</text>
    <text x="25" y="35" textAnchor="middle" fill="#0a5a8a" fontSize="5" fontWeight="600" fontFamily="Arial">CAM. NORTE</text>
  </svg>
)

const DefaultSeal2 = () => (
  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="23" fill="#e8f4fb" stroke="#1a7bb5" strokeWidth="1.5"/>
    <circle cx="25" cy="25" r="16" fill="none" stroke="#1a7bb5" strokeWidth="0.8" strokeDasharray="2 2"/>
    <text x="25" y="19" textAnchor="middle" fill="#0a5a8a" fontSize="5" fontWeight="700" fontFamily="Arial">PUBLIC</text>
    <text x="25" y="27" textAnchor="middle" fill="#1a7bb5" fontSize="11" fontWeight="900" fontFamily="Arial">₱</text>
    <text x="25" y="35" textAnchor="middle" fill="#0a5a8a" fontSize="5" fontWeight="700" fontFamily="Arial">EMPLOYMENT</text>
  </svg>
)

const DefaultSeal3 = () => (
  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="23" fill="#e8f4fb" stroke="#c0392b" strokeWidth="1.5"/>
    <circle cx="25" cy="25" r="16" fill="none" stroke="#c0392b" strokeWidth="0.8" strokeDasharray="2 2"/>
    <text x="25" y="20" textAnchor="middle" fill="#8b0000" fontSize="5.5" fontWeight="700" fontFamily="Arial">BASUD</text>
    <text x="25" y="28" textAnchor="middle" fill="#c0392b" fontSize="8" fontWeight="900" fontFamily="Arial">PESO</text>
    <text x="25" y="36" textAnchor="middle" fill="#8b0000" fontSize="4.5" fontWeight="600" fontFamily="Arial">CAM. NORTE</text>
  </svg>
)

export function computeImageRect(containerW, containerH, imgW, imgH, transform) {
  const { x = 0, y = 0, scale = 1 } = transform || {}
  const coverScale = Math.max(containerW / imgW, containerH / imgH)
  const finalScale = coverScale * scale
  const drawW = imgW * finalScale
  const drawH = imgH * finalScale
  const drawX = (containerW - drawW) / 2 + x
  const drawY = (containerH - drawH) / 2 + y
  return { drawX, drawY, drawW, drawH }
}

export function FramePreview({ data, transform, onTransformChange, onFrameSize, orientation = 'landscape' }) {
  const { photo, logo1, logo2, logo3, date, title, location, tagline, brand, brandSub, eyebrow } = data
  const { x = 0, y = 0, scale = 1 } = transform || {}

  const frameRef = useRef()
  const canvasRef = useRef()
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const lastPinchDist = useRef(null)
  const imgRef = useRef(null)
  const [frameW, setFrameW] = useState(820)
  const [frameH, setFrameH] = useState(461)

  useEffect(() => {
    if (!photo) { imgRef.current = null; drawCanvas(); return }
    const img = new Image()
    img.onload = () => { imgRef.current = img; drawCanvas() }
    img.src = photo
  }, [photo])

  useEffect(() => { drawCanvas() }, [x, y, scale, frameW, frameH, photo])

  function drawCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, frameW, frameH)
    if (!imgRef.current) return
    const img = imgRef.current
    const { drawX, drawY, drawW, drawH } = computeImageRect(frameW, frameH, img.naturalWidth, img.naturalHeight, { x, y, scale })
    ctx.drawImage(img, drawX, drawY, drawW, drawH)
  }

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setFrameW(width)
      setFrameH(height)
      if (onFrameSize) onFrameSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [onFrameSize])

  const onMouseDown = useCallback((e) => {
    if (!photo) return
    e.preventDefault()
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [photo])

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    onTransformChange(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
  }, [onTransformChange])

  const onMouseUp = useCallback(() => { dragging.current = false }, [])

  const onWheel = useCallback((e) => {
    if (!photo) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    onTransformChange(prev => ({ ...prev, scale: Math.min(5, Math.max(0.3, prev.scale + delta)) }))
  }, [photo, onTransformChange])

  const onTouchStart = useCallback((e) => {
    if (!photo) return
    if (e.touches.length === 1) {
      dragging.current = true
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastPinchDist.current = Math.hypot(dx, dy)
    }
  }, [photo])

  const onTouchMove = useCallback((e) => {
    e.preventDefault()
    if (e.touches.length === 1 && dragging.current) {
      const dx = e.touches[0].clientX - lastPos.current.x
      const dy = e.touches[0].clientY - lastPos.current.y
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      onTransformChange(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
    } else if (e.touches.length === 2 && lastPinchDist.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const delta = (dist - lastPinchDist.current) * 0.005
      lastPinchDist.current = dist
      onTransformChange(prev => ({ ...prev, scale: Math.min(5, Math.max(0.3, prev.scale + delta)) }))
    }
  }, [onTransformChange])

  const onTouchEnd = useCallback(() => {
    dragging.current = false
    lastPinchDist.current = null
  }, [])

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchmove', onTouchMove)
    }
  }, [onWheel, onTouchMove])

  const seals = [logo1, logo2, logo3]

  return (
    <div className="w-full" style={{ maxWidth: '100%', margin: '0 auto' }}>

      {/* ── SINGLE CONTAINER: photo fills 100%, overlays sit on top ── */}
      <div
        ref={frameRef}
        className="relative w-full select-none overflow-hidden"
        style={{
          aspectRatio: orientation === 'portrait' ? '3/4' : '4/3',
          background: '#111',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          borderRadius: 2,
          cursor: photo ? 'grab' : 'default',
          fontFamily: "'Arial Black', Arial, sans-serif",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >

        {/* No-photo placeholder */}
        {!photo && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8, background: '#111',
          }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" style={{ opacity: 0.12 }}>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="1.5"/>
              <circle cx="8.5" cy="10.5" r="1.5" stroke="white" strokeWidth="1.2"/>
              <path d="M3 16l5-4 4 3 3-2.5L21 17" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase' }}>
              Drop photo to start
            </span>
          </div>
        )}

        {/* Full-bleed canvas */}
        <canvas
          ref={canvasRef}
          width={frameW}
          height={frameH}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            display: 'block', pointerEvents: 'none',
          }}
        />

        {/* ── HEADER OVERLAY — transparent over top of photo ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          background: OVERLAY_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'clamp(2px,0.45vw,6px) clamp(6px,1.1vw,14px)',
          zIndex: 10,
        }}>
          {/* Brand left */}
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: 0 }}>
            <span style={{
              fontSize: 'clamp(5px,0.6vw,8px)',
              fontWeight: 900, letterSpacing: '2px',
              color: '#fff', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>
              {eyebrow || 'BASUD, CAMARINES NORTE'}
            </span>
            <span style={{
              fontSize: 'clamp(14px,2.8vw,36px)',
              fontWeight: 900, color: '#ff0000',
              letterSpacing: '-0.5px', lineHeight: 0.9,
              fontFamily: "'Arial Black', Impact, sans-serif",
              textTransform: 'uppercase',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              marginBottom: '6px'
            }}>
              {brand || 'PESO'}
            </span>
            <span style={{
              fontSize: 'clamp(4px,0.5vw,7px)',
              fontWeight: 900, letterSpacing: '1.5px',
              color: '#fff', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>
              {brandSub || 'PUBLIC EMPLOYMENT SERVICE'}
            </span>
          </div>

          {/* Seals right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(3px,0.55vw,7px)' }}>
            {seals.map((logo, i) => (
              <div key={i} style={{
                width: 'clamp(18px,2.8vw,36px)',
                height: 'clamp(18px,2.8vw,36px)',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 1px 5px rgba(0,0,0,0.3)',
                overflow: 'hidden', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {logo
                  ? <img src={logo} alt="" draggable={false} style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
                  : i === 0 ? <DefaultSeal1 /> : i === 1 ? <DefaultSeal2 /> : <DefaultSeal3 />
                }
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER OVERLAY — transparent over bottom of photo ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: OVERLAY_BG,
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(4px,0.8vw,10px)',
          padding: 'clamp(2px,0.45vw,6px) clamp(6px,1.1vw,14px)',
          zIndex: 10,
        }}>
          {/* Yellow tagline — forced single row */}
          <div style={{ flexShrink: 0 }}>
            <span style={{
              fontSize: 'clamp(5px,0.7vw,9px)',
              fontWeight: 900, color: ACCENT_YELLOW,
              fontStyle: 'italic', textTransform: 'uppercase',
              letterSpacing: '0.4px', lineHeight: 1,
              whiteSpace: 'nowrap',
              display: 'block', fontFamily: "'Arial Black', sans-serif",
              textShadow: '0 1px 4px rgba(0,0,0,0.7)',
            }}>
              {tagline || 'SERBISYONG BASUDEÑO!'}
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />

          {/* Event info */}
          <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(6px,1vw,13px)',
              fontWeight: 900, color: '#fff',
              textTransform: 'uppercase', letterSpacing: '0.2px',
              lineHeight: 1.1,
              fontFamily: "'Arial Black', Impact, sans-serif",
              marginBottom: 'clamp(1px,0.2vw,2px)',
              textShadow: '0 1px 6px rgba(0,0,0,0.8)',
            }}>
              {title || 'EVENT TITLE GOES HERE'}
            </div>
            <div style={{
              fontSize: 'clamp(4px,0.55vw,7px)',
              fontWeight: 700, color: '#fff',
              textTransform: 'uppercase', letterSpacing: '1.2px',
              fontFamily: 'Arial, sans-serif',
              marginBottom: 'clamp(1px,0.15vw,2px)',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>
              {location || 'COVERED COURT BARANGAY BACTAS, BASUD CAMARINES NORTE'}
            </div>
            <div style={{
              fontSize: 'clamp(5px,0.6vw,8px)',
              fontWeight: 900, color: '#fff',
              textTransform: 'uppercase', letterSpacing: '1.5px',
              fontFamily: "'Arial Black', sans-serif",
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>
              {date || 'MARCH 25, 2026'}
            </div>
          </div>
        </div>

        {/* Drag hint */}
        {photo && (
          <div style={{
            position: 'absolute', bottom: '14%', right: '1.5%',
            background: 'rgba(0,0,0,0.22)', color: 'rgba(255,255,255,0.28)',
            fontSize: 7, padding: '2px 5px', borderRadius: 3,
            pointerEvents: 'none', zIndex: 20,
          }}>
            drag · scroll to zoom
          </div>
        )}
      </div>
    </div>
  )
}
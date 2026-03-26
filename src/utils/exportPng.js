import { computeImageRect } from '../components/FramePreview'

// Must match FramePreview exactly
const OVERLAY_COLOR = 'rgba(135,206,235,0.52)'
const ACCENT_YELLOW = '#f5c518'

function loadImg(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function exportToPng(data) {
  const {
    photo, logo1, logo2, logo3,
    date, title, location, tagline,
    brand, brandSub, eyebrow,
    transform, filename, orientation = 'landscape'
  } = data

  if (!photo) { alert('No photo selected!'); return }

  const isPortrait = orientation === 'portrait'
  const W = isPortrait ? 900  : 1200
  const H = isPortrait ? 1200 : 900

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── 1. FULL-BLEED PHOTO ──────────────────────────────────────────────────
  const mainImg = await loadImg(photo)
  if (mainImg) {
    const { drawX, drawY, drawW, drawH } = computeImageRect(
      W, H, mainImg.naturalWidth, mainImg.naturalHeight, transform
    )
    ctx.drawImage(mainImg, drawX, drawY, drawW, drawH)
  }

  // Shared measurements (proportional to canvas size)
  const headerH = Math.round(H * 0.115)   // ~10–12% of height
  const footerH = Math.round(H * 0.105)
  const padX    = Math.round(W * 0.018)   // horizontal padding
  const padY    = Math.round(headerH * 0.14)

  // ── 2. HEADER OVERLAY ───────────────────────────────────────────────────
  ctx.fillStyle = OVERLAY_COLOR
  ctx.fillRect(0, 0, W, headerH)

  // — Brand (left) —
  const eyebrowSize = Math.round(H * 0.013)
  const brandSize   = Math.round(H * 0.075)
  const subSize     = Math.round(H * 0.011)

  // Eyebrow
  ctx.fillStyle = '#ffffff'
  ctx.font = `900 ${eyebrowSize}px Arial`
  ctx.textBaseline = 'top'
  ctx.shadowColor = 'rgba(0,0,0,0.8)'
  ctx.shadowBlur = 4
  ctx.fillText((eyebrow || 'BASUD, CAMARINES NORTE').toUpperCase(), padX, padY)

  // PESO big red
  ctx.fillStyle = '#ff0000'
  ctx.font = `900 ${brandSize}px Arial Black, Arial`
  ctx.shadowBlur = 8
  ctx.fillText((brand || 'PESO').toUpperCase(), padX, padY + eyebrowSize + 2)

  // Sub label
  ctx.fillStyle = '#ffffff'
  ctx.font = `900 ${subSize}px Arial`
  ctx.shadowBlur = 4
  ctx.fillText((brandSub || 'PUBLIC EMPLOYMENT SERVICE').toUpperCase(), padX, padY + eyebrowSize + brandSize + 2)

  ctx.shadowBlur = 0
  ctx.textBaseline = 'alphabetic'

  // — Seals (right) —
  const sealSize = Math.round(headerH * 0.72)
  const sealY    = (headerH - sealSize) / 2
  const seals    = [logo1, logo2, logo3].filter(Boolean)
  const allSeals = [logo1, logo2, logo3] // keep slots even if null

  for (let i = 0; i < 3; i++) {
    const logoSrc = allSeals[i]
    const sealX = W - padX - sealSize - (2 - i) * (sealSize + Math.round(W * 0.008))

    // White circle background
    ctx.save()
    ctx.beginPath()
    ctx.arc(sealX + sealSize / 2, sealY + sealSize / 2, sealSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 6
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.clip()

    if (logoSrc) {
      const img = await loadImg(logoSrc)
      if (img) {
        const pad = sealSize * 0.05
        ctx.drawImage(img, sealX + pad, sealY + pad, sealSize - pad * 2, sealSize - pad * 2)
      }
    }
    ctx.restore()
  }

  // ── 3. FOOTER OVERLAY ───────────────────────────────────────────────────
  const footerY = H - footerH
  ctx.fillStyle = OVERLAY_COLOR
  ctx.fillRect(0, footerY, W, footerH)

  const footerMidY   = footerY + footerH / 2
  const taglineSize  = Math.round(H * 0.016)
  const titleSize    = Math.round(H * 0.026)
  const locationSize = Math.round(H * 0.013)
  const dateSize     = Math.round(H * 0.016)

  ctx.shadowColor = 'rgba(0,0,0,0.8)'

  // — Tagline (yellow, left, single row) —
  ctx.fillStyle = ACCENT_YELLOW
  ctx.font = `900 italic ${taglineSize}px Arial Black, Arial`
  ctx.textBaseline = 'middle'
  ctx.shadowBlur = 4
  ctx.fillText((tagline || 'SERBISYONG BASUDEÑO!').toUpperCase(), padX, footerMidY)

  // Measure tagline width for divider position
  const taglineW = ctx.measureText((tagline || 'SERBISYONG BASUDEÑO!').toUpperCase()).width
  const dividerX = padX + taglineW + Math.round(W * 0.012)

  // — Vertical divider —
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(dividerX, footerY + footerH * 0.15)
  ctx.lineTo(dividerX, footerY + footerH * 0.85)
  ctx.stroke()

  // — Event title (centered in remaining space) —
  const centerX = dividerX + (W - dividerX) / 2
  ctx.textAlign = 'center'

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = `900 ${titleSize}px Arial Black, Arial`
  ctx.shadowBlur = 8
  const titleText = (title || 'EVENT TITLE GOES HERE').toUpperCase()
  // Measure and shrink if too wide
  let fSize = titleSize
  while (ctx.measureText(titleText).width > (W - dividerX - padX * 2) && fSize > 8) {
    fSize -= 1
    ctx.font = `900 ${fSize}px Arial Black, Arial`
  }
  ctx.fillText(titleText, centerX, footerMidY - locationSize - 2)

  // Location
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 ${locationSize}px Arial`
  ctx.shadowBlur = 4
  ctx.fillText((location || '').toUpperCase(), centerX, footerMidY + 4)

  // Date
  ctx.fillStyle = '#ffffff'
  ctx.font = `900 ${dateSize}px Arial Black, Arial`
  ctx.shadowBlur = 4
  ctx.fillText((date || '').toUpperCase(), centerX, footerMidY + locationSize + 8)

  ctx.shadowBlur = 0
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // ── 4. DOWNLOAD ──────────────────────────────────────────────────────────
  const base = filename ? filename.replace(/\.[^/.]+$/, '') : 'peso-frame'
  const a = document.createElement('a')
  a.download = `${base}-${orientation}-framed.png`
  a.href = canvas.toDataURL('image/png')
  a.click()
}
import { useState, useRef, useCallback } from 'react'
import { Field, Input, Textarea, SectionLabel, Divider } from './components/Fields'
import { LogoDropZone } from './components/DropZones'
import { FramePreview } from './components/FramePreview'
import { exportToPng } from './utils/exportPng'

const defaultSettings = {
  logo1: '/logo1.png',
  logo2: '/logo2.png',
  logo3: '/logo3.png',
  date: 'March 17, 2026',
  title: 'EVENT TITLE GOES HERE · BASUD PESO',
  location: 'Brgy. Location · Basud, Camarines Norte',
  tagline: 'SERBISYONG BASUDEÑO',
  social: '@basudpeso',
  brand: 'PESO',
  brandSub: 'Public Employment Service Office',
  eyebrow: 'Basud, Camarines Norte',
}

const defaultTransform = () => ({ x: 0, y: 0, scale: 1 })

export default function App() {
  const [settings, setSettings] = useState(defaultSettings)
  const [photos, setPhotos] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [orientation, setOrientation] = useState('landscape')
  const [exporting, setExporting] = useState(false)
  const [exportingAll, setExportingAll] = useState(false)
  const [frameSize, setFrameSize] = useState({ width: 820, height: 615 })
  const fileInputRef = useRef()

  const onInput = (key) => (e) => setSettings(prev => ({ ...prev, [key]: e.target.value }))
  const setS = (key) => (val) => setSettings(prev => ({ ...prev, [key]: val }))

  function handleFiles(files) {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    arr.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        setPhotos(prev => {
          const next = [...prev, { id: Date.now() + Math.random(), src: e.target.result, name: file.name, transform: defaultTransform() }]
          setActiveIdx(next.length - 1)
          return next
        })
      }
      reader.readAsDataURL(file)
    })
  }

  function removePhoto(id) {
    setPhotos(prev => {
      const next = prev.filter(p => p.id !== id)
      setActiveIdx(i => Math.max(0, Math.min(i, next.length - 1)))
      return next
    })
  }

  const handleTransformChange = useCallback((updater) => {
    setPhotos(prev => prev.map((p, i) =>
      i === activeIdx
        ? { ...p, transform: typeof updater === 'function' ? updater(p.transform) : updater }
        : p
    ))
  }, [activeIdx])

  function resetTransform() {
    setPhotos(prev => prev.map((p, i) => i === activeIdx ? { ...p, transform: defaultTransform() } : p))
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const activePhoto = photos[activeIdx]
  const currentData = { ...settings, photo: activePhoto?.src || null }
  const currentTransform = activePhoto?.transform || defaultTransform()

  async function handleExportOne() {
    if (!activePhoto) { alert('Add a photo first!'); return }
    setExporting(true)
    await exportToPng({ ...currentData, transform: currentTransform, frameSize, filename: activePhoto.name, orientation })
    setTimeout(() => setExporting(false), 800)
  }

  async function handleExportAll() {
    if (!photos.length) { alert('Add some photos first!'); return }
    setExportingAll(true)
    for (let i = 0; i < photos.length; i++) {
      await exportToPng({ ...settings, photo: photos[i].src, transform: photos[i].transform, frameSize, filename: photos[i].name, orientation })
      await new Promise(r => setTimeout(r, 500))
    }
    setExportingAll(false)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* SIDEBAR */}
      <aside className="w-[300px] flex-shrink-0 flex flex-col h-full"
        style={{ background: '#13161f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[10px] font-bold tracking-[3px] uppercase" style={{ color: '#5BC8F0' }}> PESO Frame Studio</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Basud, Camarines Norte</div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* ORIENTATION */}
          <div className="flex flex-col gap-2">
            <SectionLabel>Format</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {['landscape', 'portrait'].map(o => (
                <button key={o} onClick={() => setOrientation(o)}
                  className="py-2 rounded-lg text-[11px] font-semibold capitalize transition-all"
                  style={{
                    background: orientation === o ? '#5BC8F0' : 'rgba(255,255,255,0.04)',
                    color: orientation === o ? '#061524' : 'rgba(255,255,255,0.4)',
                    border: orientation === o ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                  }}>
                  {o === 'landscape' ? '⬛ Landscape' : '▬ Portrait'}
                </button>
              ))}
            </div>
          </div>

          <Divider />

          {/* PHOTOS */}
          <div className="flex flex-col gap-2">
            <SectionLabel>Photos ({photos.length})</SectionLabel>
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className="border-[1.5px] border-dashed rounded-xl p-4 text-center cursor-pointer transition-all"
              style={{ borderColor: 'rgba(91,200,240,0.3)', background: 'rgba(91,200,240,0.02)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#5BC8F0'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(91,200,240,0.3)'}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => handleFiles(e.target.files)} />
              <svg className="mx-auto mb-1.5 opacity-40" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="#5BC8F0" strokeWidth="1.5"/>
                <circle cx="8.5" cy="10.5" r="1.5" stroke="#5BC8F0" strokeWidth="1.2"/>
                <path d="M3 16l5-4 4 3 3-2.5L21 17" stroke="#5BC8F0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <span style={{ color: '#5BC8F0', fontWeight: 600 }}>Click or drag</span> to add photos<br/>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>Multiple images supported</span>
              </p>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {photos.map((p, i) => (
                  <div key={p.id} className="relative group cursor-pointer rounded-lg overflow-hidden"
                    style={{ aspectRatio: '4/3', border: i === activeIdx ? '2px solid #5BC8F0' : '2px solid transparent' }}
                    onClick={() => setActiveIdx(i)}>
                    <img src={p.src} alt="" className="w-full h-full object-cover" draggable={false} />
                    <button onClick={e => { e.stopPropagation(); removePhoto(p.id) }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(220,50,50,0.85)', border: 'none', cursor: 'pointer', fontSize: 8, color: '#fff' }}>✕</button>
                    {i === activeIdx && (
                      <div className="absolute bottom-0.5 left-0.5 rounded text-[7px] font-bold px-1"
                        style={{ background: '#5BC8F0', color: '#061524' }}>active</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* LOGOS */}
          <div className="flex flex-col gap-2">
            <SectionLabel>Logos / Seals</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              <LogoDropZone label="Logo 1" onLoad={setS('logo1')} />
              <LogoDropZone label="Logo 2" onLoad={setS('logo2')} />
              <LogoDropZone label="Logo 3" onLoad={setS('logo3')} />
            </div>
          </div>

          <Divider />

          {/* CAPTION */}
          <div className="flex flex-col gap-2.5">
            <SectionLabel>Caption</SectionLabel>
            <Field label="Date"><Input value={settings.date} onChange={onInput('date')} /></Field>
            <Field label="Event Title"><Textarea value={settings.title} onChange={onInput('title')} /></Field>
            <Field label="Location"><Input value={settings.location} onChange={onInput('location')} /></Field>
            <Field label="Tagline"><Input value={settings.tagline} onChange={onInput('tagline')} /></Field>
            <Field label="Social Handle"><Input value={settings.social} onChange={onInput('social')} /></Field>
          </div>

          <Divider />

          {/* BRAND */}
          <div className="flex flex-col gap-2.5">
            <SectionLabel>Brand</SectionLabel>
            <Field label="Office Name (big text)"><Input value={settings.brand} onChange={onInput('brand')} /></Field>
            <Field label="Sub Label"><Input value={settings.brandSub} onChange={onInput('brandSub')} /></Field>
            <Field label="Eyebrow Text"><Input value={settings.eyebrow} onChange={onInput('eyebrow')} /></Field>
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-5 py-4 flex flex-col gap-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleExportOne} disabled={exporting || !activePhoto}
            className="w-full font-bold text-[12px] rounded-xl py-3 cursor-pointer tracking-wide transition-all hover:opacity-85 active:scale-[0.98] disabled:opacity-40"
            style={{ background: '#5BC8F0', color: '#061524', border: 'none' }}>
            {exporting ? '⏳ Exporting...' : '⬇ Download Current'}
          </button>
          <button onClick={handleExportAll} disabled={exportingAll || !photos.length}
            className="w-full font-bold text-[12px] rounded-xl py-3 cursor-pointer tracking-wide transition-all hover:opacity-85 active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'rgba(91,200,240,0.1)', color: '#5BC8F0', border: '1px solid rgba(91,200,240,0.22)' }}>
            {exportingAll ? '⏳ Exporting all...' : `⬇ Download All (${photos.length})`}
          </button>
        </div>
      </aside>

      {/* PREVIEW */}
      <main className="flex-1 flex flex-col items-center justify-center overflow-hidden gap-3"
        style={{ background: '#0c0e14', padding: '24px 40px' }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}>

        {photos.length > 0 && (
          <div className="flex items-center gap-3 w-full justify-between" style={{ maxWidth: orientation === 'portrait' ? '460px' : '820px' }}>
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveIdx(i => Math.max(0, i - 1))} disabled={activeIdx === 0}
                className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-20"
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>←</button>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)', minWidth: 40, textAlign: 'center' }}>
                {photos.length > 0 ? `${activeIdx + 1} / ${photos.length}` : ''}
              </span>
              <button onClick={() => setActiveIdx(i => Math.min(photos.length - 1, i + 1))} disabled={activeIdx >= photos.length - 1}
                className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-20"
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>→</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleTransformChange(prev => ({ ...prev, scale: Math.max(0.3, prev.scale - 0.1) }))}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>−</button>
              <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.3)', minWidth: 36, textAlign: 'center' }}>
                {Math.round(currentTransform.scale * 100)}%
              </span>
              <button onClick={() => handleTransformChange(prev => ({ ...prev, scale: Math.min(5, prev.scale + 0.1) }))}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>+</button>
              <button onClick={resetTransform}
                className="text-[10px] px-2 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>Reset</button>
            </div>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: orientation === 'portrait' ? '460px' : '820px' }}>
          <FramePreview
            data={currentData}
            transform={currentTransform}
            onTransformChange={handleTransformChange}
            onFrameSize={setFrameSize}
            orientation={orientation}
          />
        </div>

        <p className="text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.1)' }}>
          {activePhoto ? 'Drag to pan · Scroll to zoom' : `4:3 Landscape · 3:4 Portrait`}
        </p>
      </main>
    </div>
  )
}
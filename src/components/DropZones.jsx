import { useRef, useState } from 'react'

export function PhotoDropZone({ onLoad }) {
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  function handle(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      setPreview(e.target.result)
      onLoad(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  function clear(e) {
    e.stopPropagation()
    setPreview(null)
    onLoad(null)
    inputRef.current.value = ''
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]) }}
      className={`border-[1.5px] border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
        ${dragging ? 'border-accent bg-accent/10' : 'border-accent/25 bg-accent/[0.02] hover:border-accent/60 hover:bg-accent/[0.06]'}`}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => handle(e.target.files[0])} />

      {preview ? (
        <div className="flex flex-col items-center gap-2">
          <img src={preview} alt="" className="w-full h-[72px] object-cover rounded-lg" />
          <button onClick={clear}
            className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
            ✕ Remove photo
          </button>
        </div>
      ) : (
        <>
          <svg className="mx-auto mb-2 opacity-35" width="28" height="28" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#5BC8F0" strokeWidth="1.5"/>
            <circle cx="8.5" cy="10.5" r="1.5" stroke="#5BC8F0" strokeWidth="1.2"/>
            <path d="M3 16l5-4 4 3 3-2.5L21 17" stroke="#5BC8F0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-[11px] text-white/30 leading-relaxed">
            <span className="text-accent font-semibold">Click or drag</span> your photo<br/>JPG · PNG · WEBP
          </p>
        </>
      )}
    </div>
  )
}

export function LogoDropZone({ label, onLoad }) {
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  function handle(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      setPreview(e.target.result)
      onLoad(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  function clear(e) {
    e.stopPropagation()
    setPreview(null)
    onLoad(null)
    inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-white/30">{label}</span>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]) }}
        className={`border-[1.5px] border-dashed rounded-lg p-3 text-center cursor-pointer transition-all
          min-h-[80px] flex flex-col items-center justify-center gap-1
          ${dragging ? 'border-accent bg-accent/10' : 'border-accent/20 bg-white/[0.02] hover:border-accent/50 hover:bg-accent/[0.05]'}`}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => handle(e.target.files[0])} />

        {preview ? (
          <div className="flex flex-col items-center gap-1.5">
            <img src={preview} alt="" className="w-11 h-11 object-contain rounded-full" />
            <button onClick={clear}
              className="text-[9px] text-red-400/50 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer">
              ✕ Remove
            </button>
          </div>
        ) : (
          <>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="opacity-40">
              <circle cx="12" cy="12" r="9" stroke="#5BC8F0" strokeWidth="1.5"/>
              <path d="M12 8v8M8 12h8" stroke="#5BC8F0" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-[9px] text-white/25">Upload logo</p>
          </>
        )}
      </div>
    </div>
  )
}

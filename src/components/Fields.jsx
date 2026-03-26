export function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-white/40 font-medium">{label}</label>
      {children}
    </div>
  )
}

export function Input({ ...props }) {
  return (
    <input
      className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-accent focus:bg-accent/[0.04] transition-colors w-full"
      {...props}
    />
  )
}

export function Textarea({ ...props }) {
  return (
    <textarea
      className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-accent focus:bg-accent/[0.04] transition-colors resize-y min-h-[52px] leading-relaxed w-full"
      {...props}
    />
  )
}

export function SectionLabel({ children }) {
  return (
    <div className="text-[9px] font-bold text-white/25 tracking-[2.5px] uppercase">
      {children}
    </div>
  )
}

export function Divider() {
  return <div className="border-t border-white/[0.05]" />
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] tracking-wider uppercase text-gray-500 mb-1.5">
      {children}
    </div>
  );
}

export function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs text-white font-mono">{value}</span>
    </div>
  );
}

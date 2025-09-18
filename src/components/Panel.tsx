// src/components/Panel.tsx
'use client';
export default function Panel({
  title,
  children,
  height = "h-[1000px]",
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  height?: string;
  className?: string; // ✅ accepte className
}) {
  return (
    <section
      className={`rounded-[28px] border border-neutral-800 bg-[#0d1118] shadow-[0_14px_40px_rgba(0,0,0,.5)] overflow-hidden ${height} flex flex-col ${className}`}
    >
      <header className="px-7 pt-6 pb-4">
        <h2 className="text-[26px] font-extrabold tracking-wide">{title}</h2>
      </header>
      <div className="px-6 pb-6 pt-2 border-t border-neutral-800 bg-[#0f1319] flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </section>
  );
}

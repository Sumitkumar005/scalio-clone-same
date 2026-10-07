export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function ComingSoon({ items }: { items: string[] }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white p-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">Planned for this screen</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-ink/80">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">Share a screenshot of this screen and we build it next.</p>
    </div>
  );
}

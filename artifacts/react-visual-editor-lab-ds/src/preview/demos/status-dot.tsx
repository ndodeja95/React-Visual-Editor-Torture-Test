import { StatusDot } from '../../components/ui/status-dot';

export function StatusDotDemo() {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6 text-card-foreground">
      <div className="ds-eyebrow">Runtime state</div>
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <span className="flex items-center gap-2"><StatusDot live /> Live fixture</span>
        <span className="flex items-center gap-2"><StatusDot /> Inactive fixture</span>
      </div>
    </div>
  );
}
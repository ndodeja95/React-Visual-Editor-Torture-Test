import { SourceChip } from '../../components/ui/source-chip';

export function SourceChipDemo() {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6 text-card-foreground">
      <div className="ds-eyebrow">Source metadata</div>
      <div className="flex flex-wrap gap-2">
        <SourceChip>article / header / nav</SourceChip>
        <SourceChip>useState / button</SourceChip>
        <SourceChip>sr-only / data attribute</SourceChip>
      </div>
      <p className="text-sm text-muted-foreground">
        Monospace chips are secondary metadata, not primary content.
      </p>
    </div>
  );
}
import { LabButton } from '../../components/ui/lab-button';
import { LabCard } from '../../components/ui/lab-card';
import { SourceChip } from '../../components/ui/source-chip';
import { StatusDot } from '../../components/ui/status-dot';

export function LabCardDemo() {
  return (
    <LabCard className="max-w-xl p-5 text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="ds-eyebrow flex items-center gap-2">
            <StatusDot live /> Fixture card
          </div>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">Document outline</h2>
        </div>
        <SourceChip>DOC-001</SourceChip>
      </div>
      <div className="ds-target-well mt-4 p-3 text-sm">
        A bounded target well keeps the source boundary visible.
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">One direct-edit target</span>
        <LabButton variant="primary">Inspect</LabButton>
      </div>
    </LabCard>
  );
}
import { LabInput } from '../../components/ui/lab-input';

export function LabInputDemo() {
  return (
    <div className="max-w-xl space-y-2 rounded-xl border bg-card p-6 text-card-foreground">
      <label htmlFor="lab-input-demo" className="ds-eyebrow">
        Search fixture catalog
      </label>
      <LabInput id="lab-input-demo" placeholder="Type an ID or source pattern" />
      <p className="text-xs text-muted-foreground">
        Inputs stay compact, full-width, and visibly focused for editor hit-testing.
      </p>
    </div>
  );
}
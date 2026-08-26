import { LabButton } from '../../components/ui/lab-button';
import { Row } from '../parts';

export function LabButtonDemo() {
  return (
    <div className="space-y-6 rounded-xl border bg-card p-6 text-card-foreground">
      <Row label="Variants">
        <LabButton>Default</LabButton>
        <LabButton variant="primary">Primary</LabButton>
        <LabButton variant="ghost">Ghost</LabButton>
      </Row>
      <Row label="States">
        <LabButton disabled>Disabled</LabButton>
        <LabButton variant="primary">Run fixture</LabButton>
      </Row>
    </div>
  );
}
import FieldBranchFrom from './FieldBranchFrom';
import FieldWorkers from './FieldWorkers';

export default function Forms() {
  return (
    <div className="grid content-start gap-3">
      <FieldBranchFrom />
      <FieldWorkers />
    </div>
  );
}

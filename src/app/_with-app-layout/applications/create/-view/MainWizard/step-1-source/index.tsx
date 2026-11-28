import PresetPanel from '../../LaravelPreset/PresetPanel';

import { SectionSourceGithub } from './SectionSourceGithub';

export default function Step1Source() {
  return (
    <div className="flex flex-col gap-4">
      <SectionSourceGithub />
      <PresetPanel />
    </div>
  );
}

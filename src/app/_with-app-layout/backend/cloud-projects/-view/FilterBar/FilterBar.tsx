import { Card } from '@/shared/presentation/atoms/Card';
import { SearchInput } from '@/shared/presentation/atoms/SearchInput';

import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';

export default function FilterBar() {
  const emit = useEmit();
  const [searchQuery] = useFilterModel((s) => [s.searchQuery]);

  return (
    <div>
      <Card className="mb-6">
        <div className="py-2 px-4 flex flex-wrap gap-2 lg:gap-6 justify-end">
          <SearchInput
            defaultValue={searchQuery}
            onEnter={(value) => {
              emit('@cloud-projects/filters/search--input', value);
              emit('@cloud-projects/filters/pagination--set', 1);
            }}
          />
        </div>
      </Card>
    </div>
  );
}

import { ServiceTablePartials as Partials } from './_Partials';
import type { ServicesTableProps } from './types';

export default function ServicesTable(props: ServicesTableProps) {
  const { targetServerId, services, onClickServiceDetail, onClickActivity } =
    props;

  return (
    <div className="min-w-[640px] w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Partials.RowHeader />

      {services.map((service) => {
        const { serviceName, serviceState } = service;

        return (
          <div key={serviceName}>
            <Partials.Row
              serviceName={serviceName}
              serviceState={serviceState}
              onClickServiceDetail={() => onClickServiceDetail?.(serviceName)}
              onClickActivity={(activity) =>
                onClickActivity?.({ serviceName, activity, targetServerId })
              }
            />
          </div>
        );
      })}
    </div>
  );
}

ServicesTable.PlaceholderLoading = function PlaceholderLoading() {
  return (
    <div className="min-w-[640px] w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Partials.RowHeader />

      <Partials.Row.PlaceholderLoading />
      <Partials.Row.PlaceholderLoading />
      <Partials.Row.PlaceholderLoading />
      <Partials.Row.PlaceholderLoading />
      <Partials.Row.PlaceholderLoading />
    </div>
  );
};

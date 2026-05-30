import type { ROItemProps, ReadOnlyViewProps } from './types';

const ROItem = (props: ROItemProps) => {
  const { label, value, isHidden } = props;

  return (
    <section className="flex flex-col">
      <p className="text-sm font-medium">{label}</p>
      <pre className="rounded-md border bg-background px-3 py-2 text-sm whitespace-break-spaces break-all">
        {isHidden ? <em className="opacity-50">Stored securely</em> : value}
      </pre>
    </section>
  );
};

export default function ReadOnlyView(props: ReadOnlyViewProps) {
  const { data } = props;

  return (
    <div className="mb-4 flex flex-col gap-3">
      {Object.entries(data).map((item) => {
        const [key, value] = item;

        return (
          <ROItem
            key={key}
            label={key}
            value={String(value)}
            isHidden={/(private)|(secret)|(token)/.test(key)}
          />
        );
      })}
    </div>
  );
}

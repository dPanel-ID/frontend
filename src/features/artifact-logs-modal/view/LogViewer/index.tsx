interface LogViewerProps {
  ariaLabel: string;
  log: string;
}

const LOG_OUTPUT_CLASS_NAME =
  'min-w-max whitespace-pre font-mono text-sm leading-relaxed text-white';

export default function LogViewer(props: LogViewerProps) {
  const { ariaLabel, log } = props;

  return (
    <div className="overflow-hidden rounded-lg bg-gray-900">
      <div
        aria-label={ariaLabel}
        className="h-[calc(100svh-14rem)] max-h-[48rem] min-h-[18rem] overflow-auto overscroll-contain p-3"
        role="region"
        tabIndex={0}
      >
        <pre className={LOG_OUTPUT_CLASS_NAME}>{log}</pre>
      </div>
    </div>
  );
}

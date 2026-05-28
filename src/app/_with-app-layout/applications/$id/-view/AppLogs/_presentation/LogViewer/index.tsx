interface LogViewerProps {
  ariaLabel: string;
  logs: string;
}

const LOG_OUTPUT_CLASS_NAME =
  'min-w-max whitespace-pre font-mono text-sm leading-relaxed text-white';

export default function LogViewer(props: LogViewerProps) {
  const { ariaLabel, logs } = props;

  return (
    <div className="overflow-hidden rounded-lg bg-gray-900">
      <div
        aria-label={ariaLabel}
        className="h-96 overflow-auto overscroll-contain p-3"
        role="region"
        tabIndex={0}
      >
        <pre className={LOG_OUTPUT_CLASS_NAME}>{logs}</pre>
      </div>
    </div>
  );
}

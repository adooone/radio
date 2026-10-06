import { useState } from 'react';
import type { FC } from 'react';

interface CodeBlockProps {
  code: string;
  filename?: string;
}

const CheckIconSmall: FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Check"
  >
    <title>Check</title>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CopyIconSmall: FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Copy"
  >
    <title>Copy</title>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CodeBlock: FC<CodeBlockProps> = ({ code, filename }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden bg-coal-relic border border-white/10">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-coal-deep border-b border-white/10">
          <span className="text-xs text-gray-400 font-mono">{filename}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {copied ? (
              <>
                <CheckIconSmall />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIconSmall />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <div className="relative">
        {!filename && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            {copied ? <CheckIconSmall /> : <CopyIconSmall />}
          </button>
        )}
        <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
          <code className="text-gray-300">{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;

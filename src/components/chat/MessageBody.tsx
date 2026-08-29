import { type ReactNode } from 'react';

const MD_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;
const BARE_URL = /(https?:\/\/[^\s<]+)/gi;

function isSafeHttpUrl(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function linkifyBareUrls(text: string, linkClassName: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = new RegExp(BARE_URL);
  let last = 0;
  let i = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const href = match[1];
    if (isSafeHttpUrl(href)) {
      nodes.push(
        <a
          key={`${keyPrefix}-url-${i}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {href}
        </a>,
      );
    } else {
      nodes.push(href);
    }
    last = match.index + match[0].length;
    i += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderMessageText(text: string, linkClassName: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = new RegExp(MD_LINK);
  let last = 0;
  let i = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(...linkifyBareUrls(text.slice(last, match.index), linkClassName, `pre-${i}`));
    }
    const label = match[1];
    const href = match[2];
    if (isSafeHttpUrl(href)) {
      nodes.push(
        <a
          key={`md-${i}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {label}
        </a>,
      );
    } else {
      nodes.push(match[0]);
    }
    last = match.index + match[0].length;
    i += 1;
  }
  if (last < text.length) {
    nodes.push(...linkifyBareUrls(text.slice(last), linkClassName, `post-${i}`));
  }
  return nodes;
}

interface MessageBodyProps {
  text: string;
  onDark?: boolean;
}

export function MessageBody({ text, onDark = false }: MessageBodyProps) {
  const linkClassName = onDark
    ? 'underline font-medium text-white break-all hover:opacity-90'
    : 'underline font-medium text-indigo-700 break-all hover:text-indigo-800';

  return (
    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] min-w-0 max-w-full">
      {renderMessageText(text, linkClassName)}
    </p>
  );
}

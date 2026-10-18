import { apiUrl } from '../../lib/api';
import type { WatiTemplate } from '../../types';
import { ChatImage } from './ChatImage';

interface TemplateChromeProps {
  template: WatiTemplate | undefined;
  part: 'header' | 'footer';
}

export function TemplateChrome({ template, part }: TemplateChromeProps) {
  if (!template) return null;
  if (part === 'header') {
    const headerText = (template.header_text || '').trim();
    if (!template.header_media && !headerText) return null;
    return (
      <>
        {template.header_media && (
          <ChatImage
            src={apiUrl(`/api/inbox/template-media/${encodeURIComponent(template.name)}`)}
            className="w-full max-h-56 object-cover bg-slate-100"
          />
        )}
        {headerText && <p className="mb-1 font-semibold text-slate-900">{headerText}</p>}
      </>
    );
  }

  const footer = (template.footer || '').trim();
  const buttons = template.buttons ?? [];
  if (!footer && buttons.length === 0) return null;
  return (
    <>
      {footer && <p className="mt-1 text-[11px] text-slate-500">{footer}</p>}
      {buttons.length > 0 && (
        <div className="-mx-4 mt-2 border-t border-slate-200/80">
          {buttons.map((button) =>
            button.url ? (
              <a
                key={`${button.type}-${button.text}`}
                href={button.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-b border-slate-200/80 px-3 py-2 text-center text-sm font-medium text-emerald-700 last:border-b-0 hover:bg-emerald-50"
              >
                {button.text}
              </a>
            ) : (
              <div
                key={`${button.type}-${button.text}`}
                className="border-b border-slate-200/80 px-3 py-2 text-center text-sm font-medium text-emerald-700 last:border-b-0"
              >
                {button.text}
              </div>
            ),
          )}
        </div>
      )}
    </>
  );
}

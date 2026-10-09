import { Icon, LampIconButton } from '@dendelion/func-ui';
import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

export interface PanelSection {
  title?: string;
  header?: ReactNode;
  content: ReactNode;
}

interface PanelProps {
  sections?: PanelSection[];
  content?: ReactNode;
  header?: ReactNode;
  sectionTitle?: string;
  className?: string;
  minHeight?: string;
  responsive?: boolean;
  maxColumns?: number;
  title?: string;
  subtitle?: string;
  decorated?: boolean;
  onClose?: () => void;
}

const maxColumnsClass: Record<number, string> = {
  1: 'md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1',
  2: 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export const Panel: FC<PanelProps> = ({
  sections: propSections,
  content,
  header,
  sectionTitle,
  className,
  minHeight = 'min-h-[400px]',
  responsive = true,
  maxColumns = 4,
  title,
  subtitle,
  decorated = true,
  onClose,
}) => {
  const sections =
    propSections || (content ? [{ content, header, title: sectionTitle }] : []);
  const isSingleSection = sections.length === 1;
  const shouldUseFlexLayout = (!decorated && isSingleSection) || !responsive;

  return (
    <div
      className={clsx(
        'relative flex flex-col overflow-hidden',
        decorated
          ? 'rounded-xl border border-white/10 bg-stone-900/60 shadow-2xl'
          : 'rounded-2xl border border-white/10 bg-stone-900/30 backdrop-blur-2xl',
        isSingleSection && 'h-full w-full',
        minHeight,
        className,
      )}
    >
      {(title || subtitle || onClose) && (
        <div className="relative z-10 flex flex-shrink-0 items-center gap-3 border-b border-white/10 bg-black/40 p-4">
          {onClose && (
            <LampIconButton
              tone="red"
              size="sm"
              onClick={onClose}
              label="Close"
              icon={<Icon name="close" size={16} />}
              className="flex-shrink-0"
            />
          )}
          {(title || subtitle) && (
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {title && (
                <h2 className="m-0 text-lg font-semibold text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="m-0 text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
          )}
        </div>
      )}
      <div
        className={clsx(
          'relative z-10 flex-1',
          shouldUseFlexLayout
            ? 'flex flex-col gap-6 p-3'
            : clsx('grid grid-cols-1 gap-4 p-2', maxColumnsClass[maxColumns]),
          isSingleSection &&
            'flex h-full w-full flex-col overflow-hidden !gap-0 !p-0',
        )}
      >
        {sections.map((section) => (
          <div
            key={section.title}
            className={clsx(
              'relative flex min-w-0 flex-col',
              isSingleSection && 'h-full w-full flex-1',
            )}
          >
            <div
              className={clsx(
                'flex flex-1 flex-col',
                decorated
                  ? 'rounded-md border border-white/10 bg-black/20 p-6'
                  : 'h-full w-full',
              )}
            >
              {section.header && (
                <div className="flex-shrink-0 border-b border-white/10 bg-black/40 p-4">
                  {section.header}
                </div>
              )}
              {!section.header && section.title && decorated && (
                <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {section.title}
                </span>
              )}
              {!section.header && section.title && !decorated && (
                <div className="flex-shrink-0 border-b border-white/10 bg-black/40 px-6 py-4">
                  <span className="text-lg font-semibold text-white">
                    {section.title}
                  </span>
                </div>
              )}
              <div
                className={clsx(
                  'flex min-h-0 flex-1 flex-col',
                  !decorated &&
                    'scrollbar-thin overflow-y-auto overflow-x-hidden p-6',
                )}
              >
                {section.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

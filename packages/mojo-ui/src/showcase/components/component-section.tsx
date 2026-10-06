import type { FC, ReactNode } from 'react';
import { CodeBlock } from './code-block';
import { type PropDef, PropTable } from './prop-table';

interface ComponentSectionProps {
  id: string;
  title: string;
  description: string;
  category:
    | 'basic'
    | 'form'
    | 'layout'
    | 'navigation'
    | 'feedback'
    | 'overlay'
    | 'data-display';
  children: ReactNode;
  codeExample: string;
  props?: PropDef[];
}

const categoryColors: Record<string, string> = {
  basic: 'bg-moss-DEFAULT/20 text-moss-calm',
  form: 'bg-river-DEFAULT/20 text-river-calm',
  layout: 'bg-bark-DEFAULT/20 text-bark-calm',
  navigation: 'bg-sun-DEFAULT/20 text-sun-calm',
  feedback: 'bg-ember-DEFAULT/20 text-ember-calm',
  overlay: 'bg-clay-DEFAULT/20 text-clay-DEFAULT',
  'data-display': 'bg-paper-DEFAULT/20 text-paper-DEFAULT',
};

const categoryLabels: Record<string, string> = {
  basic: 'Basic',
  form: 'Form',
  layout: 'Layout',
  navigation: 'Navigation',
  feedback: 'Feedback',
  overlay: 'Overlay',
  'data-display': 'Data Display',
};

export const ComponentSection: FC<ComponentSectionProps> = ({
  id,
  title,
  description,
  category,
  children,
  codeExample,
  props,
}) => {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[category]}`}
          >
            {categoryLabels[category]}
          </span>
        </div>
        <p className="text-gray-400">{description}</p>
      </div>

      {/* Live Preview */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          Preview
        </h3>
        <div className="p-8 rounded-xl bg-coal-deep border border-white/10 min-h-[120px] flex items-center justify-center">
          {children}
        </div>
      </div>

      {/* Code Example */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          Code
        </h3>
        <CodeBlock code={codeExample} filename={`${id}.example.tsx`} />
      </div>

      {/* Props Table */}
      {props && props.length > 0 && (
        <div className="mb-12">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropTable props={props} />
        </div>
      )}
    </section>
  );
};

export default ComponentSection;

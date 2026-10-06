import type { FC } from 'react';

export interface PropDef {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

interface PropTableProps {
  props: PropDef[];
}

export const PropTable: FC<PropTableProps> = ({ props }) => {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-coal-deep border-b border-white/10">
            <th className="text-left px-4 py-3 font-medium text-gray-300">
              Prop
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-300">
              Type
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-300">
              Default
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-300">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop, index) => (
            <tr
              key={prop.name}
              className={
                index % 2 === 0 ? 'bg-coal-DEFAULT/50' : 'bg-coal-deep/30'
              }
            >
              <td className="px-4 py-3">
                <code className="text-moss-calm font-mono text-xs">
                  {prop.name}
                  {prop.required && (
                    <span className="text-ember-DEFAULT ml-0.5">*</span>
                  )}
                </code>
              </td>
              <td className="px-4 py-3">
                <code className="text-river-calm font-mono text-xs">
                  {prop.type}
                </code>
              </td>
              <td className="px-4 py-3">
                {prop.default ? (
                  <code className="text-sun-calm font-mono text-xs">
                    {prop.default}
                  </code>
                ) : (
                  <span className="text-gray-600 text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-400">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropTable;

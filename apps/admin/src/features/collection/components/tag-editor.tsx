import { Pill, TextInput } from '@/features/admin/ui';
import { useState } from 'react';

const PREDEFINED_TAGS = [
  'Rock',
  'Pop',
  'Jazz',
  'Classical',
  'Electronic',
  'Hip-Hop',
  'Folk',
  'Blues',
  'Metal',
  'Indie',
  'Country',
  'R&B',
  'Reggae',
  'Punk',
  'Soul',
];

/** The album's tags: the usual ones to switch on, and a field for others. */
export const TagEditor = ({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) => {
  const [custom, setCustom] = useState('');

  const toggle = (tag: string) =>
    onChange(
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
    );

  const addCustom = () => {
    const tag = custom.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
      setCustom('');
    }
  };

  const extras = tags.filter((tag) => !PREDEFINED_TAGS.includes(tag));

  return (
    <div className="flex flex-col gap-3">
      <span className="type-label text-cream/60">Теги</span>
      <div className="flex flex-wrap gap-2">
        {PREDEFINED_TAGS.map((tag) => (
          <Pill
            key={tag}
            size="sm"
            tone={tags.includes(tag) ? 'lit' : 'ghost'}
            aria-pressed={tags.includes(tag)}
            onClick={() => toggle(tag)}
          >
            {tag}
          </Pill>
        ))}
        {extras.map((tag) => (
          <Pill key={tag} size="sm" tone="lit" onClick={() => toggle(tag)}>
            {tag} ✕
          </Pill>
        ))}
      </div>
      <div className="flex gap-2.5">
        <TextInput
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Інший тег…"
          aria-label="Інший тег"
          className="min-w-0 flex-1"
        />
        <Pill
          tone="ghost"
          size="sm"
          disabled={!custom.trim()}
          onClick={addCustom}
        >
          Додати
        </Pill>
      </div>
    </div>
  );
};

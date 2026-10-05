import { useState } from 'react';

type TagEditorProps = {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
};

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

export const TagEditor = ({ tags, onTagsChange }: TagEditorProps) => {
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor="custom-tag-input"
        className="block text-sm font-medium text-gray-300"
      >
        Tags
      </label>

      <div className="flex flex-wrap gap-2">
        {PREDEFINED_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              tags.includes(tag)
                ? 'bg-sun/20 text-sun border border-sun/30'
                : 'bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:bg-gray-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Selected tags:</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sun/20 text-sun border border-sun/30 text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          id="custom-tag-input"
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustomTag();
            }
          }}
          placeholder="Add custom tag..."
          className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sun/50 focus:ring-1 focus:ring-sun/50 text-sm"
        />
        <button
          type="button"
          onClick={addCustomTag}
          disabled={!customTag.trim()}
          className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
};

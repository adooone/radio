import { useState, useEffect } from 'react';
import { Input } from '@dendelion/mojo-ui';

type AlbumSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export const AlbumSearch = ({ value, onChange }: AlbumSearchProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="space-y-2 w-full">
      <div className="relative w-full">
        <Input
          type="text"
          size="small"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="Пошук..."
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10">
          {localValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:opacity-70 rounded transition-opacity"
              aria-label="Очистити пошук"
              title="Очистити пошук"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          {!localValue && (
            <svg
              aria-hidden="true"
              className="w-3.5 h-3.5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

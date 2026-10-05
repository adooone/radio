import { useUploadCoverArt } from '@/services/api';
import { useRef, useState } from 'react';

type CoverUploadProps = {
  albumId: number;
  onSuccess?: () => void;
};

export const CoverUpload = ({ albumId, onSuccess }: CoverUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadCover = useUploadCoverArt();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploadProgress(0);
      await uploadCover.mutateAsync({ id: albumId, file });
      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(null);
        onSuccess?.();
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload cover art');
      setUploadProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: drop zone delegates click to hidden file input */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-sun bg-sun/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {uploadProgress !== null ? (
          <div className="space-y-2">
            <p className="text-gray-300 mb-2">
              {uploadProgress === 100 ? 'Upload complete!' : 'Uploading...'}
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sun h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <svg
              aria-hidden="true"
              className="w-12 h-12 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-300 mb-2">
              Drag and drop an image here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              JPEG, PNG, or WebP (Max 5MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};

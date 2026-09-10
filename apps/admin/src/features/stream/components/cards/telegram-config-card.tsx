import type React from 'react';
import { useState } from 'react';
import clsx from 'clsx';
import type { TelegramStreamConfig } from '@radio/types';
import { Button } from '@dendelion/mojo-ui';
import { sharedStyles } from '@dendelion/mojo-ui/styles';
import {
  useTelegramConfig,
  useUpdateTelegramConfig,
} from '@/services/api/hooks/use-stream-control';
import { useNotificationMutation } from '@/hooks/use-notification-mutations';

// Shared input styles matching the design system
const inputStyles = [
  'w-full px-3 py-2 text-sm bg-coal/80 border border-white/20 rounded-lg',
  'text-white placeholder-white/50',
  'focus:border-amber-400/60 focus:bg-coal/90 focus:outline-none',
  'backdrop-blur-sm',
];

const readOnlyStyles = [
  'px-3 py-2 text-sm bg-coal/60 border border-white/10 rounded-lg',
  'text-white/80 font-mono',
  'backdrop-blur-sm',
];

export const TelegramConfigCard: React.FC = () => {
  const { data: config, isLoading } = useTelegramConfig();
  const rawUpdateMutation = useUpdateTelegramConfig();
  const updateConfigMutation = useNotificationMutation(rawUpdateMutation, {
    loadingMessage: 'Updating Telegram configuration...',
    successTitle: 'Configuration Updated',
    successMessage: 'Telegram configuration has been saved successfully',
    errorTitle: 'Failed to Update Configuration',
  });

  const [formData, setFormData] = useState<TelegramStreamConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const currentConfig = formData || config;

  const handleEdit = () => {
    if (config) {
      setFormData({ ...config });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setFormData(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      await updateConfigMutation.mutateAsync(formData);
      setIsEditing(false);
      setFormData(null);
    } catch (error) {
      console.error('Failed to update telegram config:', error);
    }
  };

  const handleInputChange = (
    field: keyof TelegramStreamConfig,
    value: string,
  ) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const isLoaderVisible = isLoading || updateConfigMutation.isPending;

  return (
    <div
      className={clsx(sharedStyles.statsCard, 'min-h-[320px] flex flex-col')}
    >
      {/* Header with vinyl record aesthetic */}
      <div className="mb-4 flex items-center justify-between border-b border-white/20 pb-3">
        <h3 className={clsx(sharedStyles.statsTitle, 'mb-0')}>
          Telegram Configuration
        </h3>
        {!isEditing && !isLoaderVisible && (
          <button
            type="button"
            onClick={handleEdit}
            className="px-3 py-1.5 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-400/30"
          >
            Edit
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoaderVisible && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-400" />
            <p className="ml-3 text-amber-400/70 text-sm">
              {isLoading
                ? 'Loading configuration...'
                : 'Updating configuration...'}
            </p>
          </div>
        </div>
      )}

      {/* Configuration Content */}
      {!isLoaderVisible && currentConfig && (
        <>
          <div className="flex-1 space-y-3">
            {/* Stream Key - Most important field */}
            <div>
              <label
                htmlFor="streamKey"
                className="block text-xs font-medium text-amber-400 mb-1.5 uppercase tracking-wide"
              >
                Stream Key
              </label>
              {isEditing ? (
                <input
                  id="streamKey"
                  type="text"
                  value={currentConfig.streamKey}
                  onChange={(e) =>
                    handleInputChange('streamKey', e.target.value)
                  }
                  className={clsx(inputStyles)}
                  placeholder="Enter your Telegram stream key"
                />
              ) : (
                <div className={clsx(readOnlyStyles)}>
                  {currentConfig.streamKey || 'Not configured'}
                </div>
              )}
            </div>

            {/* Advanced settings - collapsible in edit mode */}
            {isEditing && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="text-xs text-amber-400/60 uppercase tracking-wide font-medium">
                  Advanced Settings
                </div>

                {/* RTMP URL */}
                <div>
                  <label
                    htmlFor="rtmpUrl"
                    className="block text-xs font-medium text-white/60 mb-1.5"
                  >
                    RTMP URL
                  </label>
                  <input
                    id="rtmpUrl"
                    type="text"
                    value={currentConfig.rtmpUrl}
                    onChange={(e) =>
                      handleInputChange('rtmpUrl', e.target.value)
                    }
                    className={clsx(inputStyles)}
                    placeholder="rtmps://dc4-1.rtmp.t.me/s/"
                  />
                </div>

                {/* Input URL */}
                <div>
                  <label
                    htmlFor="inputUrl"
                    className="block text-xs font-medium text-white/60 mb-1.5"
                  >
                    Input URL
                  </label>
                  <input
                    id="inputUrl"
                    type="text"
                    value={currentConfig.inputUrl}
                    onChange={(e) =>
                      handleInputChange('inputUrl', e.target.value)
                    }
                    className={clsx(inputStyles)}
                    placeholder="rtmp://localhost:1935/live/test"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Controls section - always at bottom */}
          {isEditing && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex gap-2 justify-center">
                <Button
                  variant="green"
                  size="small"
                  title="Save"
                  onClick={handleSave}
                  disabled={updateConfigMutation.isPending}
                />
                <Button
                  variant="yellow"
                  size="small"
                  title="Cancel"
                  onClick={handleCancel}
                  disabled={updateConfigMutation.isPending}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {updateConfigMutation.error && (
            <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs">
              Failed to update configuration. Please try again.
            </div>
          )}
        </>
      )}
    </div>
  );
};

import type React from 'react';
import { useState } from 'react';
import clsx from 'clsx';
import type { RtmpServerConfig } from '@radio/types';
import { Button } from '@dendelion/mojo-ui';
import { sharedStyles } from '@dendelion/mojo-ui/styles';
import {
  useRtmpConfig,
  useUpdateRtmpConfig,
} from '@/services/api/hooks/use-stream-control';

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

export const RtmpConfigCard: React.FC = () => {
  const { data: config, isLoading } = useRtmpConfig();
  const updateConfigMutation = useUpdateRtmpConfig();
  const [formData, setFormData] = useState<RtmpServerConfig | null>(null);
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
      console.error('Failed to update RTMP config:', error);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    if (!formData) return;

    if (field.includes('.')) {
      // Handle nested fields
      const [parent, child, grandchild] = field.split('.');
      setFormData((prev) => {
        if (!prev) return prev;
        const parentObj = prev[parent as keyof RtmpServerConfig];
        if (!parentObj || typeof parentObj !== 'object') return prev;

        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: grandchild
              ? {
                  ...(((parentObj as Record<string, unknown>)[child] as Record<
                    string,
                    unknown
                  >) || {}),
                  [grandchild]: value,
                }
              : value,
          },
        };
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleArrayChange = (field: string, value: string) => {
    if (!formData) return;
    const ips = value
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);
    handleInputChange(field, ips);
  };

  const isLoaderVisible = isLoading || updateConfigMutation.isPending;

  return (
    <div
      className={clsx(sharedStyles.statsCard, 'min-h-[320px] flex flex-col')}
    >
      {/* Header with vinyl record aesthetic */}
      <div className="mb-4 flex items-center justify-between border-b border-white/20 pb-3">
        <h3 className={clsx(sharedStyles.statsTitle, 'mb-0')}>
          RTMP Server Configuration
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
            {/* Basic Settings */}
            <div className="grid grid-cols-2 gap-3">
              {/* Port */}
              <div>
                <label
                  htmlFor="port"
                  className="block text-xs font-medium text-amber-400 mb-1.5 uppercase tracking-wide"
                >
                  Port
                </label>
                {isEditing ? (
                  <input
                    id="port"
                    type="number"
                    min="1"
                    max="65535"
                    value={currentConfig.port}
                    onChange={(e) =>
                      handleInputChange(
                        'port',
                        Number.parseInt(e.target.value, 10),
                      )
                    }
                    className={clsx(inputStyles)}
                    placeholder="1935"
                  />
                ) : (
                  <div className={clsx(readOnlyStyles)}>
                    {currentConfig.port}
                  </div>
                )}
              </div>

              {/* Max Connections */}
              <div>
                <label
                  htmlFor="maxConnections"
                  className="block text-xs font-medium text-amber-400 mb-1.5 uppercase tracking-wide"
                >
                  Max Connections
                </label>
                {isEditing ? (
                  <input
                    id="maxConnections"
                    type="number"
                    min="1"
                    max="10000"
                    value={currentConfig.maxConnections}
                    onChange={(e) =>
                      handleInputChange(
                        'maxConnections',
                        Number.parseInt(e.target.value, 10),
                      )
                    }
                    className={clsx(inputStyles)}
                    placeholder="200"
                  />
                ) : (
                  <div className={clsx(readOnlyStyles)}>
                    {currentConfig.maxConnections}
                  </div>
                )}
              </div>
            </div>

            {/* HLS Settings */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="text-xs text-amber-400/60 uppercase tracking-wide font-medium">
                HLS Settings
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* HLS Enabled */}
                <div>
                  <label
                    htmlFor="hlsEnabled"
                    className="block text-xs font-medium text-amber-400/80 mb-1.5 uppercase tracking-wide"
                  >
                    HLS Enabled
                  </label>
                  {isEditing ? (
                    <select
                      id="hlsEnabled"
                      value={
                        currentConfig.application.hls.enabled ? 'true' : 'false'
                      }
                      onChange={(e) =>
                        handleInputChange(
                          'application.hls.enabled',
                          e.target.value === 'true',
                        )
                      }
                      className={clsx(inputStyles)}
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  ) : (
                    <div className={clsx(readOnlyStyles)}>
                      {currentConfig.application.hls.enabled
                        ? 'Enabled'
                        : 'Disabled'}
                    </div>
                  )}
                </div>

                {/* Fragment Length */}
                <div>
                  <label
                    htmlFor="fragmentLength"
                    className="block text-xs font-medium text-amber-400/80 mb-1.5 uppercase tracking-wide"
                  >
                    Fragment (s)
                  </label>
                  {isEditing ? (
                    <input
                      id="fragmentLength"
                      type="number"
                      min="1"
                      max="30"
                      value={currentConfig.application.hls.fragmentLength}
                      onChange={(e) =>
                        handleInputChange(
                          'application.hls.fragmentLength',
                          Number.parseInt(e.target.value, 10),
                        )
                      }
                      className={clsx(inputStyles)}
                      placeholder="3"
                    />
                  ) : (
                    <div className={clsx(readOnlyStyles)}>
                      {currentConfig.application.hls.fragmentLength}s
                    </div>
                  )}
                </div>

                {/* Playlist Length */}
                <div>
                  <label
                    htmlFor="playlistLength"
                    className="block text-xs font-medium text-amber-400/80 mb-1.5 uppercase tracking-wide"
                  >
                    Playlist (s)
                  </label>
                  {isEditing ? (
                    <input
                      id="playlistLength"
                      type="number"
                      min="10"
                      max="300"
                      value={currentConfig.application.hls.playlistLength}
                      onChange={(e) =>
                        handleInputChange(
                          'application.hls.playlistLength',
                          Number.parseInt(e.target.value, 10),
                        )
                      }
                      className={clsx(inputStyles)}
                      placeholder="60"
                    />
                  ) : (
                    <div className={clsx(readOnlyStyles)}>
                      {currentConfig.application.hls.playlistLength}s
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced settings - collapsible in edit mode */}
            {isEditing && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="text-xs text-amber-400/60 uppercase tracking-wide font-medium">
                  Advanced Settings
                </div>

                {/* Allow Publish From */}
                <div>
                  <label
                    htmlFor="allowPublishFrom"
                    className="block text-xs font-medium text-white/60 mb-1.5"
                  >
                    Allow Publish From (comma-separated IPs)
                  </label>
                  <input
                    id="allowPublishFrom"
                    type="text"
                    value={currentConfig.application.allowPublishFrom.join(
                      ', ',
                    )}
                    onChange={(e) =>
                      handleArrayChange(
                        'application.allowPublishFrom',
                        e.target.value,
                      )
                    }
                    className={clsx(inputStyles)}
                    placeholder="127.0.0.1, 100.74.63.70"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Chunk Size */}
                  <div>
                    <label
                      htmlFor="chunkSize"
                      className="block text-xs font-medium text-white/60 mb-1.5"
                    >
                      Chunk Size
                    </label>
                    <input
                      id="chunkSize"
                      type="number"
                      min="128"
                      max="65536"
                      value={currentConfig.chunkSize}
                      onChange={(e) =>
                        handleInputChange(
                          'chunkSize',
                          Number.parseInt(e.target.value, 10),
                        )
                      }
                      className={clsx(inputStyles)}
                      placeholder="16384"
                    />
                  </div>

                  {/* Drop Idle Publisher */}
                  <div>
                    <label
                      htmlFor="dropIdlePublisher"
                      className="block text-xs font-medium text-white/60 mb-1.5"
                    >
                      Drop Idle (s)
                    </label>
                    <input
                      id="dropIdlePublisher"
                      type="number"
                      min="5"
                      max="300"
                      value={currentConfig.application.dropIdlePublisher}
                      onChange={(e) =>
                        handleInputChange(
                          'application.dropIdlePublisher',
                          Number.parseInt(e.target.value, 10),
                        )
                      }
                      className={clsx(inputStyles)}
                      placeholder="30"
                    />
                  </div>
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

          {/* Info Message */}
          {!isEditing && (
            <div className="mt-3 p-2 bg-amber-500/20 border border-amber-500/30 rounded text-amber-400 text-xs">
              Changes require RTMP server restart to take effect.
            </div>
          )}
        </>
      )}
    </div>
  );
};

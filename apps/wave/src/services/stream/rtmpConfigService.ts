import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RtmpServerConfig } from '@radio/types';

export class RtmpConfigService {
  private dataDir = join(process.cwd(), 'data');
  private configFile = join(this.dataDir, 'rtmp-config.json');
  private nginxConfTemplate = join(process.cwd(), 'src/conf/nginx.conf');

  // Default RTMP server configuration
  private defaultConfig: RtmpServerConfig = {
    port: 1935,
    chunkSize: 16384,
    maxConnections: 200,
    outQueue: 4096,
    outCork: 8,
    pingInterval: 30,
    pingTimeout: 15,
    application: {
      name: 'live',
      allowPublishFrom: ['127.0.0.1', '100.74.63.70'],
      allowPlayFrom: 'all',
      hls: {
        enabled: true,
        fragmentLength: 3,
        playlistLength: 60,
        cleanup: true,
      },
      recording: {
        enabled: false,
        path: '/data/recordings',
      },
      dropIdlePublisher: 30,
      syncDelay: 10,
    },
  };

  async getRtmpConfig(): Promise<RtmpServerConfig> {
    try {
      if (existsSync(this.configFile)) {
        const configData = await readFile(this.configFile, 'utf-8');
        const config = JSON.parse(configData) as RtmpServerConfig;
        // Merge with defaults to ensure all properties exist
        return { ...this.defaultConfig, ...config };
      }
    } catch (error) {
      console.error('Error loading RTMP config:', error);
    }
    return this.defaultConfig;
  }

  async updateRtmpConfig(
    updates: Partial<RtmpServerConfig>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const currentConfig = await this.getRtmpConfig();
      const newConfig = { ...currentConfig, ...updates };

      // Deep merge application settings if provided
      if (updates.application) {
        newConfig.application = {
          ...currentConfig.application,
          ...updates.application,
        };

        // Deep merge hls settings if provided
        if (updates.application.hls) {
          newConfig.application.hls = {
            ...currentConfig.application.hls,
            ...updates.application.hls,
          };
        }

        // Deep merge recording settings if provided
        if (updates.application.recording) {
          newConfig.application.recording = {
            ...currentConfig.application.recording,
            ...updates.application.recording,
          };
        }
      }

      // Validate configuration
      const validation = this.validateConfig(newConfig);
      if (!validation.isValid) {
        return {
          success: false,
          message: `Invalid configuration: ${validation.error}`,
        };
      }

      // Save configuration
      await writeFile(this.configFile, JSON.stringify(newConfig, null, 2));

      // Generate new nginx.conf
      await this.generateNginxConfig(newConfig);

      return {
        success: true,
        message:
          'RTMP configuration updated successfully. Restart RTMP server to apply changes.',
      };
    } catch (error) {
      console.error('Error updating RTMP config:', error);
      return {
        success: false,
        message: `Failed to update RTMP configuration: ${error}`,
      };
    }
  }

  private validateConfig(config: RtmpServerConfig): {
    isValid: boolean;
    error?: string;
  } {
    // Port validation
    if (config.port < 1 || config.port > 65535) {
      return { isValid: false, error: 'Port must be between 1 and 65535' };
    }

    // Chunk size validation
    if (config.chunkSize < 128 || config.chunkSize > 65536) {
      return {
        isValid: false,
        error: 'Chunk size must be between 128 and 65536',
      };
    }

    // Max connections validation
    if (config.maxConnections < 1 || config.maxConnections > 10000) {
      return {
        isValid: false,
        error: 'Max connections must be between 1 and 10000',
      };
    }

    // HLS fragment length validation
    if (
      config.application.hls.fragmentLength < 1 ||
      config.application.hls.fragmentLength > 30
    ) {
      return {
        isValid: false,
        error: 'HLS fragment length must be between 1 and 30 seconds',
      };
    }

    // HLS playlist length validation
    if (
      config.application.hls.playlistLength < 10 ||
      config.application.hls.playlistLength > 300
    ) {
      return {
        isValid: false,
        error: 'HLS playlist length must be between 10 and 300 seconds',
      };
    }

    return { isValid: true };
  }

  private async generateNginxConfig(config: RtmpServerConfig): Promise<void> {
    const nginxConfig = `worker_processes auto;

events {
    worker_connections 1024;
}

rtmp {
    server {
        listen ${config.port};
        chunk_size ${config.chunkSize};
        max_connections ${config.maxConnections};

        out_queue ${config.outQueue};
        out_cork ${config.outCork};

        ping ${config.pingInterval}s;
        ping_timeout ${config.pingTimeout}s;

        application ${config.application.name} {
            live on;
            record ${config.application.recording.enabled ? 'all' : 'off'};
            ${
              config.application.recording.enabled &&
              config.application.recording.path
                ? `record_path ${config.application.recording.path};`
                : ''
            }

            # Access control
            ${config.application.allowPublishFrom
              .map((ip) => `allow publish ${ip};`)
              .join('\n            ')}
            allow play ${config.application.allowPlayFrom};

            ${
              config.application.hls.enabled
                ? `hls on;
            hls_path /data/hls;
            hls_fragment ${config.application.hls.fragmentLength}s;
            hls_playlist_length ${config.application.hls.playlistLength}s;
            hls_cleanup ${config.application.hls.cleanup ? 'on' : 'off'};`
                : 'hls off;'
            }

            drop_idle_publisher ${config.application.dropIdlePublisher}s;
            sync ${config.application.syncDelay}ms;
        }
    }
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # Logging
    access_log /var/log/nginx/access.log combined;
    error_log /var/log/nginx/error.log warn;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_types application/x-mpegurl text/plain application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=hls:10m rate=30r/s;

    server {
        listen 8069;
        server_name _;

        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\\n";
            add_header Content-Type text/plain;
        }

        # HLS streaming endpoint
        location /hls {
            limit_req zone=hls burst=20 nodelay;
            
            # Serve HLS files
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }
            root /data;
            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin * always;
        }

        # Stats endpoint for monitoring
        location /stats {
            limit_req zone=api burst=10 nodelay;
            rtmp_stat all;
            rtmp_stat_stylesheet stat.xsl;
            add_header Access-Control-Allow-Origin * always;
        }

        location /stat.xsl {
            root /var/www/html;
        }
    }
}`;

    const configPath = join(process.cwd(), 'src/conf/nginx.conf');
    await writeFile(configPath, nginxConfig);
  }
}

export const rtmpConfigService = new RtmpConfigService();

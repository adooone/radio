module.exports = {
  apps: [
    {
      name: 'radio.wave',
      script: 'bun',
      args: 'src/index.ts',
      instances: 1,
      env_production: { PORT: 6970, SOCKET_PORT: 6971 },
      // Disable log rotation and use smaller log files
      log_file: './logs/wave.log',
      out_file: './logs/wave-out.log',
      error_file: './logs/wave-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      log_file_max_size: '10M',
      log_file_backups: 0,
      disable_logs: false,
    },
  ],
};

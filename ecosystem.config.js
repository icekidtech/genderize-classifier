module.exports = {
  apps: [
    {
      name: 'genderize-classifier',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Restart policies
      autorestart: true,
      max_memory_restart: '300M',
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      // Logging
      error_file: 'logs/error.log',
      out_file: 'logs/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // File watching for auto-restart on relevant changes
      watch: false, // Set to true if you want auto-restart on file changes
      ignore_watch: ['node_modules', 'logs', '.git'],
      // Additional settings
      merge_logs: true,
      max_old_space_size: 256,
    },
  ],
};

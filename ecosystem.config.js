module.exports = {
  apps: [
    {
      name: 'nard-frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 8083',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
    },
  ],
};

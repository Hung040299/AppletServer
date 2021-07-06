module.exports = {
  apps: [
    {
      name: 'applet',
      script: './node_modules/.bin/ts-node',
      args: "app.js",
      instance_var: 'INSTANCE_ID', // See http://pm2.keymetrics.io/docs/usage/environment/#specific-environment-variables
      env: {
        PORT: 10011,
        NODE_ENV: 'development'
      },
      env_production: {
        PORT: 10011,
        NODE_ENV: 'production'
      },
      watch: true,
      ignore_watch: ['node_modules']
    }
  ]
}

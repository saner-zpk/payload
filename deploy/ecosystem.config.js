module.exports = {
  apps: [
    {
      name: "payload",
      script: "server.js",
      cwd: ".next/standalone", // 确保服务器在正确工作目录
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
        PORT: 3033
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3033,
        // 生产环境的 DB / Secret，最好通过 system secrets 注入
        DATABASE_URI: "mongodb://mongo_sDsKth:mongo_bGASke@<MONGO_HOST>:27017/payload?authSource=admin",
        PAYLOAD_SECRET: "YOUR_PRODUCTION_SECRET",
        NEXT_PUBLIC_SERVER_URL: "https://your-domain.com"
      }
    }
  ]
}
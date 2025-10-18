// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "api-backup-server", // Nome da sua API principal, se houver
      script: "node_modules/tsx/dist/cli.cjs",
      interpreter: "node",
      args: [
        "--env-file",
        ".env",
        "--experimental-strip-types",
        "src/server.ts" // O arquivo que a API Fastify deve processar
      ],
      env: process.env,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "200M",
      instances: 1, // A API geralmente precisa de apenas 1 instância, a menos que você tenha um load balancer
      autorestart: true,
      restart_delay: 5000,
      error_file: "logs/api-backup-server-err.log",
      out_file: "logs/api-backup-server-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
    {
      name: "backup-worker", // Nome do seu worker
      script: "node_modules/tsx/dist/cli.cjs", // Usa o tsx para executar o worker
      interpreter: "node",
      args: [
        "--env-file",
        ".env",
        "--experimental-strip-types",
        "src/workers/worker.ts" // O arquivo do seu worker
      ],
      env: process.env,
      exec_mode: "fork", // Use 'fork' para processos independentes
      watch: false,
      max_memory_restart: "500M", // Aumente a memória se os backups forem intensos
      instances: 4, // Defina o número de workers que você deseja rodar
      autorestart: true,
      restart_delay: 5000,
      error_file: "logs/backup-worker-err.log",
      out_file: "logs/backup-worker-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ],
};
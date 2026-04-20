// ecosystem.config.cjs
module.exports = {
  apps: [
   
    {
      name: "backup-worker", // Nome do seu worker
      script: "node_modules/tsx/dist/cli.cjs", // Usa o tsx para executar o worker
      interpreter: "node",
      args: [
        "--env-file",
        ".env",
        "--experimental-strip-types",
        "src/index.ts" // O arquivo do seu worker
      ],
      exec_mode: "fork", // Use 'fork' para processos independentes
      watch: false,
      max_memory_restart: "1G", // Aumente a memória se os backups forem intensos
      instances: 3, // Defina o número de workers que você deseja rodar
      autorestart: true,
      restart_delay: 5000,
      error_file: "logs/backup-worker-err.log",
      out_file: "logs/backup-worker-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
       {
      name: "backup-delete-arquivos", // Nome do seu worker
      script: "node_modules/tsx/dist/cli.cjs", // Usa o tsx para executar o worker
      interpreter: "node",
      args: [
        "--env-file",
        ".env",
        "--experimental-strip-types",
        "src/jobs/delete-arquivos-zip-job.ts" // O arquivo do seu worker
      ],
      exec_mode: "fork", // Use 'fork' para processos independentes
      watch: false,
      max_memory_restart: "200M", // Aumente a memória se os backups forem intensos
      instances: 3, // Defina o número de workers que você deseja rodar
      autorestart: true,
      restart_delay: 5000,
      error_file: "logs/backup-delete-arquivos.log",
      out_file: "logs/backup-delete-arquivos.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
     
  ],
};


 
// ecosystem.config.cjs
module.exports = {
  apps: [
      {
      name: "api-backup",
      // O script principal agora é o executável CLI do tsx
      script: "node_modules/tsx/dist/cli.cjs", // Use o caminho relativo correto ou absoluto
      
        interpreter: "node",

        // Os argumentos para o "script" (cli.js do tsx)
        args: [
          "--env-file", // Argumento para o tsx
          ".env",       // Valor do argumento --env-file
          "--experimental-strip-types", // Outro argumento para o tsx
          "src/server.ts" // O arquivo que o tsx deve processar, passado como argumento final para o tsx
        ],
       
        exec_mode: "fork",
        watch: false,
        max_memory_restart: "1G",
        instances: 1,
        autorestart: true,
        restart_delay: 5000,
        error_file: "logs/api-backup-err.log",
        out_file: "logs/api-backup-out.log",
        log_date_format: "YYYY-MM-DD HH:mm:ss"
      } , 
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
      exec_mode: "fork", // Use 'fork' para processos independentes
      watch: false,
      max_memory_restart: "1G", // Aumente a memória se os backups forem intensos
      instances: 5, // Defina o número de workers que você deseja rodar
      autorestart: true,
      restart_delay: 5000,
      error_file: "logs/backup-worker-err.log",
      out_file: "logs/backup-worker-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
     
  ],
};


 
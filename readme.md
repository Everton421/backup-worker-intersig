# API Backup (agendamento e execução de backups)

API responsável por agendar e executar backups de bancos MySQL de clientes do ERP. Fornece endpoints para disparar backup manual, testar conexão ao banco do cliente e serviços para execução agendada e distribuída via fila RabbitMQ.

Principais arquivos e símbolos
- Servidor e bootstrap: [`server`](src/server.ts) — [src/server.ts](src/server.ts) e [`server`](src/app.ts) — [src/app.ts](src/app.ts)
- Execução do backup (core): [`execBackup`](src/services/exe-backup.ts) — [src/services/exe-backup.ts](src/services/exe-backup.ts)
- Dump do banco (mysqldump): [`dumpDatabase`](src/services/dump-database.ts) — [src/services/dump-database.ts](src/services/dump-database.ts)
- Limpeza de arquivos temporários: [`limparArquivosSql`](src/services/delete-arquivos.ts) — [src/services/delete-arquivos.ts](src/services/delete-arquivos.ts)
- Exclusão de arquivos ZIP antigos: [`deleteZipFiles`](src/services/delete-arquivos-zip.ts) — [src/services/delete-arquivos-zip.ts](src/services/delete-arquivos-zip.ts)
- Job de exclusão agendada: [`deleteZipFilesJob`](src/jobs/delete-arquivos-zip-job.ts) — [src/jobs/delete-arquivos-zip-job.ts](src/jobs/delete-arquivos-zip-job.ts)
- Agendamento periódico: [`mainTask`](src/services/auto-exe-backup.ts) — [src/services/auto-exe-backup.ts](src/services/auto-exe-backup.ts)
- Fila / worker RabbitMQ: consumidor [`consumeBackupMessages`](src/utils/consume-backup-message.ts) — [src/utils/consume-backup-message.ts](src/utils/consume-backup-message.ts) e produtor [`sendBackupMessage`](src/utils/send-backup-message.ts) — [src/utils/send-backup-message.ts](src/utils/send-backup-message.ts)
- Endpoint de execução manual: rota [`/executar-backup/:codigo`] implementada em [src/routes/executar-backup/executar-backup.ts](src/routes/executar-backup/executar-backup.ts)
- Endpoint de teste de conexão: rota em [src/routes/teste-conexao-banco-cliente/teste-conexao-banco-cliente.ts](src/routes/teste-conexao-banco-cliente/teste-conexao-banco-cliente.ts)
- Arquivos de configuração: [package.json](package.json) e [ecosystem.config.cjs](ecosystem.config.cjs)
- Variáveis de ambiente: [.env](.env)

Visão geral de funcionamento
- A API inicia o servidor HTTP (Fastify) e registra rotas em [src/app.ts](src/app.ts).
- Agendador (`mainTask`) lê clientes habilitados no banco e agenda jobs com `node-cron`. Cada job envia uma mensagem para a fila RabbitMQ via [`sendBackupMessage`](src/utils/send-backup-message.ts).
- Workers (processos) executam [`consumeBackupMessages`](src/utils/consume-backup-message.ts) para processar mensagens e chamar [`execBackup`](src/services/exe-backup.ts).
- O fluxo de backup:
  1. Gera dump usando [`dumpDatabase`](src/services/dump-database.ts) (executa mysqldump.exe).
  2. Cria ZIP com os arquivos SQL (ver [`zip.ts`] se presente).
  3. Limpa arquivos temporários com [`limparArquivosSql`](src/services/delete-arquivos.ts).
  4. Atualiza status no banco via Drizzle ORM (tabela `clientes`).
- Limpeza automática de arquivos antigos:
  - O job [`deleteZipFilesJob`](src/jobs/delete-arquivos-zip-job.ts) executa diariamente (meia-noite) para excluir arquivos ZIP antigos.
  - Utiliza [`deleteZipFiles`](src/services/delete-arquivos-zip.ts) que verifica a data de criação dos arquivos e exclui aqueles mais antigos que o intervalo configurado (em relação à data do último backup).
  - Compara a data de criação do arquivo (`birthtime`) com a data limite calculada (data do último backup menos o intervalo de dias).

Endpoints importantes
- POST /executar-backup/:codigo — inicia backup manual para cliente (route em [src/routes/executar-backup/executar-backup.ts](src/routes/executar-backup/executar-backup.ts))
- POST /conexao/teste — testa conexão MySQL de credenciais fornecidas (route em [src/routes/teste-conexao-banco-cliente/teste-conexao-banco-cliente.ts](src/routes/teste-conexao-banco-cliente/teste-conexao-banco-cliente.ts))
- Rotas de usuário e clientes em [src/routes](src/routes)

Variáveis de ambiente (mínimas)
- PORT_API — porta do servidor (ex.: 3333) — [.env](.env)
- DATABASE_URL — conexão principal do sistema
- RABBITMQ_URL — URL do RabbitMQ (ex.: amqp://user:pass@host)
- PATH_BACKUPS — diretório no qual os backups são gravados
- PATH_CERT / PATH_KEY — certificados para HTTPS (opcional em produção)
Consulte [src/app.ts](src/app.ts) e [.env](.env)

Scripts úteis
- Desenvolvimento: npm run dev (ver [package.json](package.json))
- Iniciar: npm start
- Testar worker/local: npm run test:worker
- Testar DB script: npm run test:db

PM2 / produção
- Arquivo de configuração PM2: [ecosystem.config.cjs](ecosystem.config.cjs) — configura app principal e workers.

Observações e pontos de atenção
- O utilitário mysqldump é chamado como executável relativo em [`dumpDatabase`](src/services/dump-database.ts). Garanta que `mysqldump.exe` exista no caminho esperado ou ajuste o caminho.
- Diretório temporário usado: `temp/` e backups finais em `backups/` ou `PATH_BACKUPS` (ver [src/services/exe-backup.ts](src/services/exe-backup.ts)).
- Mensagens RabbitMQ são persistentes na fila `backup_queue` (produtor em [src/utils/send-backup-message.ts](src/utils/send-backup-message.ts) e consumidor em [src/utils/consume-backup-message.ts](src/utils/consume-backup-message.ts)).
- Autenticação e hooks JWT: veja [src/hooks/check-request-jwt.ts](src/hooks/check-request-jwt.ts) e [src/hooks/check-user-jwt.ts](src/hooks/check-user-jwt.ts).
- Exclusão de arquivos antigos: o job [`deleteZipFilesJob`](src/jobs/delete-arquivos-zip-job.ts) executa diariamente às 00:00 (cron: `0 0 * * *`). O intervalo padrão de exclusão é configurável (atualmente 5 dias). O serviço verifica a data de criação dos arquivos (`birthtime`) no diretório de backups do cliente e exclui arquivos mais antigos que a data limite calculada.

Como rodar local (rápido)
1. Instalar dependências:
   npm install
2. Configurar .env com RABBITMQ_URL, PATH_BACKUPS, etc. ([.env](.env))
3. Iniciar servidor:
   npm start
4. Iniciar workers (se usar localmente): usar PM2 com [ecosystem.config.cjs](ecosystem.config.cjs) ou executar `src/workers/worker.ts` via tsx (o script `test:worker` ajuda).

Contato
- Código-fonte principal: [src](src)

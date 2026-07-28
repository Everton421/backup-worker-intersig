# backup-worker — Worker de Backups MySQL via RabbitMQ

Worker que consome mensagens de uma fila RabbitMQ e executa backups de bancos MySQL de clientes do ERP. Projetado para processamento paralelo com múltiplas instâncias gerenciadas por PM2.

---

## Funcionalidades

- **Consumo de fila RabbitMQ** — Escuta a fila `backup_queue` e processa backups sob demanda conforme as mensagens chegam
- **Geração de dump MySQL** — Executa `mysqldump.exe` para cada banco de dados do cliente
- **Compactação com 7-Zip** — Arquivos SQL são comprimidos em ZIP para armazenamento
- **Múltiplos workers concorrentes** — Até 3 instâncias via PM2 processando em paralelo com `prefetch(1)`
- **Validação de conectividade pré-backup** — Antes do dump, testa a conexão MySQL com as credenciais do cliente
- **Persistência de status** — Atualiza `clientes.status_backup` no banco principal (pendente → em-andamento → finalizado / erro)
- **Limpeza de arquivos temporários** — Remove arquivos SQL do diretório `temp/` após a compactação
- **Limpeza programada de backups antigos** — Job `node-cron` (CRON configurável) que exclui ZIPs com base na data do último backup + intervalo de retenção
- **Auto-reconexão RabbitMQ** — Reconecta automaticamente em caso de falha de conexão (delay de 5s)
- **Mensagens persistentes** — Fila durável com `noAck: false` e mensagens persistentes; garante que nenhum job seja perdido se o worker cair
- **Gerenciamento PM2** — Auto-restart, logs rotativos e múltiplas instâncias em produção

---

## Stack

| Tecnologia | Uso |
|---|---|
| Node.js + TypeScript | Runtime e linguagem |
| RabbitMQ (amqplib) | Fila de mensagens |
| MySQL (mysql2) | Conexão com bancos dos clientes |
| Drizzle ORM | Persistência de status no banco principal |
| mysqldump | Geração dos dumps SQL |
| 7-Zip | Compactação dos arquivos |
| node-cron | Agendamento da limpeza de backups antigos |
| PM2 | Gerenciamento de processos |
| tsx | Execução TypeScript |

---

## Fluxo de Funcionamento

```
Sistema externo / agendador
       │
       │  sendBackupMessage()
       ▼
┌─────────────────────┐
│  RabbitMQ           │
│  backup_queue       │
│  (durável)          │
└──────────┬──────────┘
           │ consume
           ▼
┌──────────────────────┐
│  consumeBackupMessages │  ← worker (x3 via PM2)
│  prefetch(1)         │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  execBackup()        │
│                      │
│  1. Testa conexão    │
│     MySQL do cliente │
│  2. dumpDatabase()   │  ← mysqldump.exe
│     para cada banco  │
│  3. Aguarda 10s      │
│  4. zipFiles()       │  ← 7z.exe
│  5. limparArquivosSql│  ← remove .sql temporários
│  6. Atualiza status  │  ← Drizzle ORM
└──────────────────────┘
```

### Limpeza programada de backups antigos

```
deleteZipFilesJob()  ← node-cron (default: 0 0 * * *)
       │
       ▼
deleteOldBackups()
       │
       ├─ Lê clientes com efetuar_backup = 'S'
       ├─ Para cada cliente:
       │    ├─ caminho = caminhoBkp
       │    ├─ dataLimite = data_ultimo_backup - 5 dias
       │    └─ Exclui ZIPs com birthtime < dataLimite
       └─ Fim
```

---

## Formato da Mensagem (RabbitMQ)

A fila `backup_queue` espera mensagens JSON no formato:

```json
{
  "codigo": 1,
  "config": {
    "host": "localhost",
    "porta": "3306",
    "usuario": "intersig",
    "senha": "123"
  },
  "databaseName": "lps",
  "databases": ["lps_cep"],
  "pathZip": "C:/backup-api"
}
```

> Tipo `Messagebackup` definido em `src/@types/IMessage-backup.ts`.

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | URL de conexão com o banco principal do sistema (Drizzle ORM) |
| `RABBITMQ_URL` | Sim | URL do RabbitMQ (ex.: `amqp://user:pass@host`) |
| `PATH_BACKUPS` | Não | Diretório onde os backups são gravados (default: `C:/backups-api`) |
| `MYSQLDUMP_PATH` | Não | Caminho do executável `mysqldump` (default: `./mysqldump.exe`) |
| `CRON_DELETE_ARQUIVOS` | Não | Expressão CRON para limpeza de backups antigos (default: `0 0 * * *`) |
| `NODE_ENV` | Não | Ambiente (`production`, `development`) |

---

## PM2 — Produção

O arquivo `ecosystem.config.cjs` configura duas aplicações:

| App | Instâncias | Descrição |
|---|---|---|
| `backup-worker` | 3 (fork) | Workers de backup — executam `src/index.ts` |
| `backup-delete-arquivos` | 1 (fork) | Job de limpeza de backups antigos — executam `src/jobs/job-delete-backups.ts` |

```bash
pm2 start ecosystem.config.cjs
```

Ambos os apps possuem autorestart, restart delay de 5s e logs separados com rotação.

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- RabbitMQ acessível
- Banco MySQL principal com as tabelas `clientes` e `usuarios`
- `mysqldump.exe` no caminho do projeto (ou configurar `MYSQLDUMP_PATH`)
- `7z.exe` no caminho do projeto

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env (veja .env.example)
#    DATABASE_URL, RABBITMQ_URL são obrigatórias

# 3. Iniciar worker
npm start
```

### Scripts

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o worker principal (consome mensagens RabbitMQ) |
| `npm run delete:arquivos` | Executa o job de limpeza de backups antigos (uma execução) |

### Enviar mensagem de teste

```bash
tsx --env-file .env --experimental-strip-types src/__test__/teste.ts
```

---

## Estrutura do Projeto

```
src/
├── @types/                    # Tipos TypeScript
│   ├── IMessage-backup.ts     # Interface da mensagem RabbitMQ
│   └── fastify.d.ts           # Declaração de tipos Fastify (não utilizado)
├── __test__/                  # Scripts de teste
│   ├── teste.ts               # Envia mensagem de backup para a fila
│   └── teste-conexao.ts       # Testa conexão MySQL
├── broker/
│   └── broker-connection.ts   # Conexão RabbitMQ + produtor (sendBackupMessage)
├── database/
│   ├── client.ts              # Cliente Drizzle ORM (banco principal)
│   ├── mysql-create-pool.ts   # Pool MySQL para conexão com clientes
│   └── schema.ts              # Schema das tabelas clientes e usuarios
├── hooks/
│   └── data-hook.ts           # Utilitário de formatação de data/hora
├── jobs/
│   ├── delete-arquivos-backup.ts  # Script único de limpeza
│   └── job-delete-backups.ts      # Job agendado (node-cron)
├── services/
│   ├── exe-backup.ts              # Orquestrador principal do backup
│   ├── dump-database.ts           # Executa mysqldump
│   ├── zip.ts                     # Compacta com 7z.exe
│   ├── delete-arquivos.ts         # Remove arquivos SQL temporários
│   ├── delete-arquivos-zip.ts     # Remove ZIPs antigos
│   └── delete-old-backups.ts      # Lógica de limpeza de backups antigos
├── utils/
│   ├── consume-backup-message.ts  # Consumidor RabbitMQ (worker principal)
│   ├── check-file-in-use.ts       # Verifica se arquivo está em uso
│   ├── create-directory.ts        # Cria diretórios recursivamente
│   └── delay.ts                   # Função de delay (Promise)
├── workers/
│   └── worker.ts                  # Entry point alternativo do worker
└── index.ts                       # Entry point principal
```

---

## Observações

- O worker **não expõe servidor HTTP**. Toda comunicação é feita via fila RabbitMQ.
- O agendamento de backups (horário de cada cliente) deve ser feito por um sistema externo que envia mensagens para a fila — este worker apenas **consome e executa**.
- O job de limpeza de backups antigos usa `birthtime` do sistema de arquivos para determinar a idade dos arquivos.
- O intervalo de retenção de backups antigos está atualmente fixado em **5 dias** em `delete-old-backups.ts:21`.

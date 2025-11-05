import { mysqlTable, mysqlSchema,   int, varchar, MySqlEnumColumn, char, unique, date, mysqlEnum,text  } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"
import { datetime } from "drizzle-orm/mysql-core";
import { time } from "drizzle-orm/mysql-core";

 
export const acessoCliente = char("acesso", [ "L","B","A"])
export const statusBackup = char("STATUS_BACKUP", ["finalizado","em-andamento","erro","pendente"])

export const efetuarBackup = char("EFETUAR_BACKUP", ["S","N"]);

export const clientes = mysqlTable("clientes", {
    codigo: int("CODIGO").autoincrement().notNull(),
    codMatriz: int("COD_MATRIZ").default(0).notNull(),
    atendente: char("ATENDENTE", { length: 40 }).default('').notNull(),
    contrato: char("CONTRATO", { length: 4 }).default('NULL'),
    acesso: acessoCliente.default('L').notNull(),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dataLiberacao: date("DATA_LIBERACAO", { mode: 'string' }).default('0000-00-00').notNull(),
    diasUso: int("DIAS_USO").default(0).notNull(),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dataAcesso: date("DATA_ACESSO", { mode: 'string' }).default('0000-00-00').notNull(),
    razaoSocial: varchar("RAZAO_SOCIAL", { length: 100 }).default('\'').notNull(),
    nomeFantasia: varchar("NOME_FANTASIA", { length: 50 }).default('\'').notNull(),
    nomeReduz: varchar("NOME_REDUZ", { length: 10 }).default('\'').notNull(),
    ip: varchar("IP", { length: 15 }).default('\'').notNull(),
    cnpj: varchar("CNPJ", { length: 20 }).default('\'').notNull(),
    inscricao: varchar("INSCRICAO", { length: 20 }).default('\'').notNull(),
    cep: varchar("CEP", { length: 9 }).default('\'').notNull(),
    endereco: varchar("ENDERECO", { length: 100 }).default('\'').notNull(),
    numero: varchar("NUMERO", { length: 10 }).default('\'').notNull(),
    complemento: varchar("COMPLEMENTO", { length: 100 }).default('\'').notNull(),
    bairro: varchar("BAIRRO", { length: 100 }).default('\'').notNull(),
    cidade: varchar("CIDADE", { length: 50 }).default('\'').notNull(),
    estado: char("ESTADO", { length: 2 }).default('').notNull(),
    email: varchar("EMAIL", { length: 50 }).default('\'').notNull(),
    telefone: varchar("TELEFONE", { length: 15 }).default('\'').notNull(),
    fax: varchar("FAX", { length: 15 }).default('\'').notNull(),
    sistema: char("SISTEMA", { length: 1 }).default('2').notNull(),
    empresa: char("EMPRESA", { length: 1 }).default('N').notNull(),
    qtdeFiliais: int("QTDE_FILIAIS").default(1).notNull(),
    qtdeTerminais: int("QTDE_TERMINAIS").default(1).notNull(),
    host: varchar("HOST", { length: 255 }).default('\'').notNull(),
    portaTs: int("PORTA_TS").default(0).notNull(),
    usuarioTs: varchar("USUARIO_TS", { length: 20 }).default('\'').notNull(),
    senhaTs: varchar("SENHA_TS", { length: 20 }).default('\'').notNull(),
    senhaRootTs: varchar("SENHA_ROOT_TS", { length: 20 }).default('\'').notNull(),
    portaSsh: int("PORTA_SSH").default(0).notNull(),
    usuarioSsh: varchar("USUARIO_SSH", { length: 20 }).default('\'').notNull(),
    senhaSsh: varchar("SENHA_SSH", { length: 20 }).default('\'').notNull(),
    senhaRootSsh: varchar("SENHA_ROOT_SSH", { length: 20 }).default('\'').notNull(),
    portaVnc: int("PORTA_VNC").default(0).notNull(),
    senhaVnc: varchar("SENHA_VNC", { length: 20 }).default('\'').notNull(),
    portaMysql: int("PORTA_MYSQL").default(0).notNull(),
    usuarioMysql: varchar("USUARIO_MYSQL", { length: 20 }).default('\'').notNull(),
    senhaMysql: varchar("SENHA_MYSQL", { length: 20 }).default('\'').notNull(),
    senhaRootMysql: varchar("SENHA_ROOT_MYSQL", { length: 20 }).default('\'').notNull(),
    idTeamviewer: int("ID_TEAMVIEWER").default(0).notNull(),
    senhaTeamviewer: varchar("SENHA_TEAMVIEWER", { length: 50 }).default('\'').notNull(),
    emailCont: varchar("EMAIL_CONT", { length: 50 }).default('\'').notNull(),
    versaoFinanceiro: int("VERSAO_FINANCEIRO").default(0).notNull(),
    versaoVendas: int("VERSAO_VENDAS").default(0).notNull(),
    versaoContabil: int("VERSAO_CONTABIL").default(0).notNull(),
    versaoPcp: int("VERSAO_PCP").default(0).notNull(),
    versaoShopping: int("VERSAO_SHOPPING").default(0).notNull(),
    versaoTelevendas: int("VERSAO_TELEVENDAS").default(0).notNull(),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dataCadastro: date("DATA_CADASTRO", { mode: 'string' }).default('0000-00-00').notNull(),
    contato: varchar("CONTATO", { length: 255 }).default('NULL'),
    nomeRadmin: varchar("NOME_RADMIN", { length: 255 }).default('NULL'),
    senhaRadmin: varchar("SENHA_RADMIN", { length: 255 }).default('NULL'),
    nomeBanco: varchar("NOME_BANCO", { length: 255 }).default('NULL'),
    ativo: char("ATIVO", { length: 1 }).default('S'),
    caminhoBkp: varchar("CAMINHO_BKP", { length: 255 }).default('NULL'),
    observacao: varchar("OBSERVACAO", { length: 255 }).default('NULL'),
    dataModificacao: varchar("DATA_MODIFICACAO", { length: 255 }).default('NULL'),
    arquivoMaisRecente: varchar("ARQUIVO_MAIS_RECENTE", { length: 255 }).default('NULL'),
    nomeCertificado: varchar("NOME_CERTIFICADO", { length: 255 }).default('NULL'),
    senhaCertificado: varchar("SENHA_CERTIFICADO", { length: 255 }).default('NULL'),
    // Warning: Can't parse blob from database
    // blobType: blob("CERTIFICADO"),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dataAtualizacao: date("DATA_ATUALIZACAO", { mode: 'string' }).default('0000-00-00'),
    latitude: varchar("LATITUDE", { length: 255 }).default('NULL'),
    longitude: varchar("LONGITUDE", { length: 255 }).default('NULL'),
    tipoVersao: varchar("TIPO_VERSAO", { length: 255 }).default('NULL'),
    atualizar: mysqlEnum("ATUALIZAR", ['S','N']).default('N'),
    data_ultimo_backup: datetime("DATA_ULTIMO_BACKUP" , { mode: 'string' } ).default('NULL'),
    hora_agenda_backup: time("HORA_AGENDA_BACKUP"   ).default('00:00:00'),
    bancos_backup: varchar("BANCOS_BACKUP"  ,{ length: 255 }).default('NULL'),
    status_backup: statusBackup.default('pendente'),
    efetuar_backup: efetuarBackup.default('N'), 
    msg_backup: text("MSG_BACKUP").default('NULL'),
    },
(table) => [
    unique("CNPJ").on(table.cnpj),
]);

 export const users = mysqlTable('usuarios',{
    id: int().autoincrement().notNull(),
    email_user: varchar({length:255}).default('NULL'),
    senha_user: varchar({length:255}).default('NULL'),
    type: varchar({length:255}).default('NULL'),
    user_name: varchar({length:255}).default('NULL'),
    reset_token: varchar({length:255}).default('NULL'),
    reset_token_validade: datetime({mode:'string'}).default('NULL') 
 })
 
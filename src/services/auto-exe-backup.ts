 
import path from 'path'

import { db } from '../database/client.ts';
import { clientes } from '../database/schema.ts';
import { eq } from 'drizzle-orm';
import cron  from 'node-cron'
 

import { createClientPoolConnection } from '../database/mysql-create-pool.ts';
import { sendBackupMessage } from '../utils/send-backup-message.ts';
 
    export type mysqlConfig = {
        host:string,
        porta:string,
        usuario:string,
        senha:string
    }


type resultDatabase =  { database_name: string } 
 

  function formatHours(stringHour: string) {
    const horaFormatada = new Date('2023-01-01 ' + stringHour).toLocaleTimeString('pt-br', { hour: '2-digit'  })
    return horaFormatada
  }

    function formatMinutes(stringHour: string) {
    const minutes = new Date('2023-01-01 ' + stringHour).toLocaleTimeString('pt-br', {  minute:'2-digit'  })
    return minutes
  }


const scheduledBackups: Map<number, any> = new Map();

 export async function mainTask() {
    cron.schedule(' */1 * * * *', async () => {
        console.log("Tarefa principal iniciada: Verificando clientes e agendando backups.");

        try {
            const resultClientExecBackup = await db.select().from(clientes).where(eq(clientes.efetuar_backup, 'S'));

            if (resultClientExecBackup.length > 0) {
                for (const clientConfig of resultClientExecBackup) {
                    const { codigo, nomeFantasia, hora_agenda_backup, host, portaMysql, senhaMysql, usuarioMysql, nomeBanco , caminhoBkp} = clientConfig;

                    // Cancelar o agendamento existente, se houver
                    if (scheduledBackups.has(codigo)) {
                        const job = scheduledBackups.get(codigo);
                        if (job) {
                            job.stop();
                        }
                        scheduledBackups.delete(codigo);
                    }

                    if (hora_agenda_backup) {
                        const hourBackup = Number(formatHours(hora_agenda_backup));
                        const minutesBackup = Number(formatMinutes(hora_agenda_backup));

                        if (isNaN(hourBackup) || isNaN(minutesBackup) || hourBackup < 0 || hourBackup > 23 || minutesBackup < 0 || minutesBackup > 59) {
                            console.error(`Hora de backup inválida para o cliente ${nomeFantasia}. Verifique a configuração.`);
                            continue;
                        }

                        // Criar e iniciar o novo agendamento
                        const job: any = cron.schedule(`${minutesBackup} ${hourBackup} * * *`, async () => {
                            console.log(`Tarefa de backup iniciada para ${nomeFantasia} às ${hourBackup}:${minutesBackup}`);


                            if (!host || !portaMysql || !senhaMysql || !usuarioMysql || !nomeBanco) {
                                console.error(`Verifique o cadastro cliente ${nomeFantasia}, verifique as configurações da conexão do banco de dados do cliente`);
                                return;
                            }

                            const config: mysqlConfig = {
                                host: host,
                                porta: String(portaMysql),
                                senha: senhaMysql,
                                usuario: usuarioMysql
                            };

                            try {
                                const conn = await createClientPoolConnection(host, senhaMysql, usuarioMysql, String(portaMysql));

                                if (conn !== null) {
                                     const databasePublico = nomeBanco+'_publico';
                                     const databaseVendas  = nomeBanco+'_vendas';
                                     const databaseFinanceiro  = nomeBanco+'_financeiro';
                                     const databaseEstoque  = nomeBanco+'_estoque';

                                    const [results] = await conn.query(`SELECT schema_name as database_name FROM information_schema.schemata WHERE schema_name IN 
                                        ( 
                                        '${databasePublico}',
                                        '${databaseVendas}',
                                        '${databaseFinanceiro}',
                                        '${databaseEstoque}'
                                        ) ;`) as [resultDatabase[], any];

                                    const resultDatabases = results;

                                    if (resultDatabases.length > 0) {
                                        const databases: string[] = [];
                                        resultDatabases.forEach((db) => {
                                            databases.push(db.database_name);
                                        });

                                          let pathZip 
                                        if(caminhoBkp){
                                              pathZip = caminhoBkp
                                        }else{
                                            if(process.env.PATH_BACKUPS){
                                                pathZip = process.env.PATH_BACKUPS
                                            }else{
                                                 pathZip = path.resolve(__dirname,'../../backups')
                                            }
                                        }
                                            sendBackupMessage({ codigo: Number(codigo), config: config, databases: databases  , databaseName:String(nomeBanco), pathZip:pathZip })
                                    }
                                }else{
                                       await db.update(clientes)
                                        .set(
                                            { 
                                                status_backup: 'pendente',  
                                                msg_backup:"Erro ao tentar se conectar com o host"
                                                })
                                            .where(eq(clientes.codigo, clientConfig.codigo ))
                                      }
                                } catch (error) {
                                    console.error(`Erro ao executar o backup para ${nomeFantasia}:`, error);
                                }
                            });

                            scheduledBackups.set(codigo, job);
                            job.start();

                        } else {
                            console.warn(`Cliente ${nomeFantasia} habilitado para backup, mas sem hora agendada. Ignorando.`);
                        }
                    }
                    console.log("agendamentos concluido")
            } else {
                console.log("Nenhum cliente habilitado para backup encontrado.");
            }
        } catch (error) {
            console.error("Erro ao processar a tarefa principal:", error);
        }

        console.log("Tarefa principal finalizada.");
    });

    console.log("Tarefa principal agendada  ");
}
 
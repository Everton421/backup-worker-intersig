import fs from 'fs'
import { execFile , spawn} from 'child_process';
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'; // Importe para usar o import.meta.url
import { dumpDatabase } from './dump-database.ts';
import { zipBackup } from './zip.ts';
import { limparArquivosSql } from './delete-arquivos.ts';
import { dateHook } from '../hooks/data-hook.ts';
import { randomUUID } from 'node:crypto';
import { db } from '../database/client.ts';
import { clientes } from '../database/schema.ts';
import { eq, sql } from 'drizzle-orm';
import cron from 'node-cron'
import { createClientPoolConnection } from '../database/mysql-create-pool.ts';

    export type mysqlConfig = {
        host:string,
        porta:string,
        usuario:string,
        senha:string
    }


type resultDatabase =  { database_name: string } 
 

export async function  execBackup (codigoCliente:number, config:mysqlConfig, databases:string[], databaseName:string){

        const id = randomUUID();

        const dateService = dateHook();
        const {  data, hora} = dateService.getDataHora()

  const __dirname = dirname(fileURLToPath(import.meta.url))
 
 
  const zipPath = path.resolve(__dirname,'../../backups', `Bkp-${databaseName}_${data}_${hora}.zip`)

    try{
         if( databases.length > 0 ){
             for( const  database  of databases ){
                
                await dumpDatabase(config, database, id ).then(result => {
                            console.log(result);
                        }).catch(err => {
                            console.error(err);
                 return { erro:true, msg: `erro ao tentar  executar o dump ${err}`  }

                    });
                }
            

         }else{
                    await db.update(clientes)
             .set(
                { 
                    status_backup: 'erro',  
                    msg_backup:"nenhum banco de dados disponivel para backup, verifique o nome do banco de dados do cliente"
                    })
                .where(eq(clientes.codigo, codigoCliente ))
                 return { erro:true, msg:'nenhum banco de dados disponivel para backup!'    }
 
         }

       zipBackup(zipPath,databases, id )
    .then(() =>  {    return { erro:false, msg: `Backup realizado com sucesso!` }})
    .catch( async (err )=> {
              await db.update(clientes)
             .set(
                { 
                    status_backup: 'erro',  
                    msg_backup:"erro ao tentar  executar o zip dos arquivos"
                    })
        return { erro:true, msg:`erro ao tentar  executar o zip dos arquivos ${err}`   }
        } );

             for( const  database  of databases ){
                 limparArquivosSql(database, id)
            }
       

             await db.update(clientes)
             .set(
                { 
                  data_ultimo_backup: sql`NOW()`,
                  arquivoMaisRecente: `Bkp-${databaseName}_${data}_${hora}.zip`, 
                    status_backup: 'finalizado',  
                    bancos_backup: String(databases), 
                    msg_backup: ` backup executado com sucesso arquivo: Bkp-${databaseName}_${data}_${hora}.zip `
                })
                .where(eq(clientes.codigo, codigoCliente ))
    }catch(e){
                 await db.update(clientes).set( { status_backup: 'erro',  
                    msg_backup:"erro ao tentar  executar o zip dos arquivos"  })   

        return { erro:true, msg: ` erro ao tentar executar o backup ${e} `  }
    }



}

  function formatHours(stringHour: string) {
    const horaFormatada = new Date('2023-01-01 ' + stringHour).toLocaleTimeString('pt-br', { hour: '2-digit'  })
    return horaFormatada
  }

    function formatMinutes(stringHour: string) {
    const minutes = new Date('2023-01-01 ' + stringHour).toLocaleTimeString('pt-br', {  minute:'2-digit'  })
    return minutes
  }

export async function mainTask() {
    // Agendar a tarefa principal para rodar às 5:00 AM todos os dias
    cron.schedule('0 5 * * *', async () => {
        console.log("Tarefa principal iniciada: Verificando clientes e agendando backups.");

        try {
            // Busca todos os clientes que devem ter o backup executado
            const resultClientExecBackup = await db.select().from(clientes).where(eq(clientes.efetuar_backup, 'S'));

            if (resultClientExecBackup.length > 0) {
                for (const clientConfig of resultClientExecBackup) {
                    // Para cada cliente, agenda o backup no horário configurado
                    if (clientConfig.hora_agenda_backup) {
                        const hourBackup = Number(formatHours(clientConfig.hora_agenda_backup));
                        const minutesBackup = Number(formatMinutes(clientConfig.hora_agenda_backup));

                        // Garante que os valores de hora e minuto são válidos
                        if (isNaN(hourBackup) || isNaN(minutesBackup) || hourBackup < 0 || hourBackup > 23 || minutesBackup < 0 || minutesBackup > 59) {
                            console.error(`Hora de backup inválida para o cliente ${clientConfig.nomeFantasia}. Verifique a configuração.`);
                            continue; // Pula para o próximo cliente
                        }

                        // Agenda o backup para o cliente específico
                        cron.schedule(`${minutesBackup} ${hourBackup} * * *`, async () => {
                            console.log(`Tarefa de backup iniciada para ${clientConfig.nomeFantasia} às ${hourBackup}:${minutesBackup}`);

                            const { codigo, host, portaMysql, senhaMysql, usuarioMysql, nomeBanco } = clientConfig;

                            if (!host || !portaMysql || !senhaMysql || !usuarioMysql || !nomeBanco) {
                                console.error(`Verifique o cadastro cliente ${clientConfig.nomeFantasia}, verifique as configurações da conexão do banco de dados do cliente`);
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
                                    const [results] = await conn.query(`SELECT schema_name as database_name FROM information_schema.schemata WHERE schema_name LIKE '%${nomeBanco}%';`) as [resultDatabase[], any];

                                    const resultDatabases = results; // Remove a necessidade de casting

                                    if (resultDatabases.length > 0) {
                                        const databases: string[] = [];
                                        resultDatabases.forEach((db) => {
                                            databases.push(db.database_name);
                                        });
                                        await execBackup(Number(codigo), config, databases, String(nomeBanco));
                                    }
                                }
                            } catch (error) {
                                console.error(`Erro ao executar o backup para ${clientConfig.nomeFantasia}:`, error);
                            }
                        });

                        console.log(`Backup agendado para ${clientConfig.nomeFantasia} às ${hourBackup}:${minutesBackup}`);
                    } else {
                        console.warn(`Cliente ${clientConfig.nomeFantasia} habilitado para backup, mas sem hora agendada. Ignorando.`);
                    }
                }
            } else {
                console.log("Nenhum cliente habilitado para backup encontrado.");
            }
        } catch (error) {
            console.error("Erro ao processar a tarefa principal:", error);
        }

        console.log("Tarefa principal finalizada.");
    });

    console.log("Tarefa principal agendada para rodar às 5:00 AM todos os dias.");
}

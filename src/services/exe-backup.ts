import fs from 'fs'
import { execFile, spawn } from 'child_process';
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'; // Importe para usar o import.meta.url
import { dumpDatabase } from './dump-database.ts';
import { limparArquivosSql } from './delete-arquivos.ts';
import { dateHook } from '../hooks/data-hook.ts';
import { randomUUID } from 'node:crypto';
import { db } from '../database/client.ts';
import { clientes } from '../database/schema.ts';
import { eq, sql } from 'drizzle-orm';
import { createDirectory } from '../utils/create-directory.ts';
import { zipFiles } from './zip.ts';
import { delay } from '../utils/delay.ts';
import { createClientPoolConnection } from '../database/mysql-create-pool.ts';
export type mysqlConfig = {
    host: string,
    porta: string,
    usuario: string,
    senha: string
}

 
/**
 * 
 * @param codigoCliente codigo do cliente a ser executado o backup. 
 * @param config configurações do banco de dados a ser executado o backup.
 * @param databases nome dos banco de dados a serem executado.
 * @param databaseName nome em comun entre os bancos de dados. 
 * @param pathZip caminho onde será salvo o arquivo de backup.
 * @returns 
 */

export async function execBackup(codigoCliente: number, config: mysqlConfig, databases: string[], databaseName: string, pathZip?: string) {

    const id = randomUUID();

    const dateService = dateHook();
    const { data, hora } = dateService.getDataHora()

    let pathBackups = 'C:/backups-api'

    if (!fs.existsSync(pathBackups)) {
        createDirectory(pathBackups);
    }

    let pastaClient

    if (pathZip) {
        pastaClient = pathZip
    } else {
        pastaClient = databaseName
    }

    let pathzipComplete = path.resolve(pathBackups, pastaClient)


    //const __filename = fileURLToPath("file:///C:/Users/usuario/Desktop/apps/api-backup/src/services/exec-backup.ts");
    //const  dirnameServices = path.dirname(__dirname);
    const __dirname = dirname(fileURLToPath(import.meta.url))
    let zipPath = path.resolve(__dirname, '../../backups', `Bkp-${databaseName}_${data}_${hora}.zip`)


    if (fs.existsSync(pathzipComplete)) {
        zipPath = path.resolve(pathzipComplete, `Bkp-${databaseName}_${data}_${hora}.zip`)
    } else {
        createDirectory(pathzipComplete);
        zipPath = path.resolve(pathzipComplete, `Bkp-${databaseName}_${data}_${hora}.zip`)
    }

    try {
        if (databases.length > 0) {

            await db.update(clientes)
                .set({ status_backup: 'em-andamento', msg_backup: `backup do dia ${data} ${hora} em andamento` }).
                where(eq(clientes.codigo, codigoCliente))

            //// testa a conexao antes de tentar fazer o dump
                const conn= await createClientPoolConnection(config.host, config.senha,  config.usuario,  config.porta);                    
                    let statusResultQuery= { sucess:false , message:''};
                    try{
                        const  [rows]   = await conn.query(' SELECT 1 ') as any[];
                        statusResultQuery.sucess= true
                    }catch(e ){
                        statusResultQuery.sucess= false
                        statusResultQuery.message = String(e); 
                    }
                  if (!statusResultQuery.sucess) {
                    await db.update(clientes).set({ status_backup: 'erro', msg_backup: `Erro ao tentar se conectar com o host [ ${statusResultQuery.message} ]  ` })
                    .where(eq(clientes.codigo, codigoCliente))
                    return { erro: true, msg: ` ${statusResultQuery.message}` }
                
                }


            let resultStatus
            for (const database of databases) {

                resultStatus = await dumpDatabase(config, database, id).then(result => {
                    console.log(result);
                }).catch(async (err) => {
                       await db.update(clientes)
                        .set({ status_backup: 'erro', msg_backup:  JSON.stringify(err) })
                        .where(eq(clientes.codigo, codigoCliente))
                    console.error(err);
                    return { erro: true, msg: ` ${err.msg}` }

                });
            }
            // se ocorrer algum erro no dump, faz a exclusao dos arquivos com problema
            if (resultStatus && resultStatus.erro) {
                await db.update(clientes)
                    .set({ status_backup: 'erro', msg_backup: resultStatus.msg })
                    .where(eq(clientes.codigo, codigoCliente))

                for (const database of databases) {
                    limparArquivosSql(database, id)
                }
                return { erro: true, msg: resultStatus.msg }
            }

               await delay(10000);
            
        const resultZipfiles = await zipFiles(zipPath, databases, id)

        if (resultZipfiles.erro) {
            await db.update(clientes)
            .set({ status_backup: 'erro', msg_backup: `erro ao tentar  executar o zip dos arquivos ${resultZipfiles.error || resultZipfiles.msg}` })
            .where(eq(clientes.codigo, codigoCliente))

        }

        for (const database of databases) {
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
            .where(eq(clientes.codigo, codigoCliente))

        } else {
            await db.update(clientes)
                .set(
                    {  status_backup: 'erro',
                        msg_backup: "nenhum banco de dados disponivel para backup, verifique o nome do banco de dados do cliente"
                    })
                .where(eq(clientes.codigo, codigoCliente))
            return { erro: true, msg: 'nenhum banco de dados disponivel para backup!' }
        }

         
    } catch (e) {
        await db.update(clientes).set({
             status_backup: 'erro',
             msg_backup:  String(e)  
          })
         .where(eq(clientes.codigo, codigoCliente))
          console.log(e)

        return { erro: true, msg: ` erro ao tentar executar o backup ${e} ` }
    }



}


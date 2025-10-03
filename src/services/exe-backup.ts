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
    export type mysqlConfig = {
        host:string,
        porta:string,
        usuario:string,
        senha:string
    }


 

export async function  execBackup (codigoCliente:number, config:mysqlConfig, databases:string[], databaseName:string){

        const id = randomUUID();

        const dateService = dateHook();
        const {  data, hora} = dateService.getDataHora()

 //const __filename = fileURLToPath("file:///C:/Users/usuario/Desktop/apps/api-backup/src/services/exec-backup.ts");
 //const  dirnameServices = path.dirname(__dirname);
 const __dirname = dirname(fileURLToPath(import.meta.url))
       let zipPath = path.resolve(__dirname,'../../backups', `Bkp-${databaseName}_${data}_${hora}.zip`)

        if( process.env.PATH_BACKUPS){
            let folder =process.env.PATH_BACKUPS
                if( fs.existsSync(folder)){
                  zipPath =  path.resolve(folder , `Bkp-${databaseName}_${data}_${hora}.zip`)
                }
            }

  

    try{
         if( databases.length > 0 ){
            let resultStatus 
            for( const  database  of databases ){
                
                resultStatus = await dumpDatabase(config, database, id ).then(result => {
                            console.log(result);
                        }).catch(err => {
                            console.error(err);
                         return { erro:true, msg: `erro ao tentar  executar o dump ${err.msg}`  }

                    });
                }
                if( resultStatus && resultStatus.erro){
            await db.update(clientes)
             .set(
                { status_backup: 'erro',  
                    msg_backup: resultStatus.msg 
                    })
                .where(eq(clientes.codigo, codigoCliente ))
                 return { erro:true, msg:resultStatus.msg     }

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

       zipBackup(zipPath, databases,id)
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

   
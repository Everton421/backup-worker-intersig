import { createClientPoolConnection } from "../database/mysql-create-pool.ts";
import path from 'path'
import { sendBackupMessage } from "../utils/send-backup-message.ts";

type resultDatabase =  { database_name: string } 
                             
                             const conn = await createClientPoolConnection('192.168.100.106', "Nileduz",'intersig', String(3306));
    if(conn){
        const nomeBanco = 'ic';

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

                                      console.log(results);
                                      
                    //                let pathZip = path.resolve('../../backups')
                    //        const databases: string[] =[]
                    //            for(const i of results ){
                    //              databases.push(i.database_name)
                    //            }
//
                    //        if(process.env.PATH_BACKUPS){
                    //                            pathZip = process.env.PATH_BACKUPS
                    //                        }
//
                    //       sendBackupMessage(
                    //        { codigo: Number(17),
                    //         config: {
                    //           host:'192.168.100.106',
                    //          porta:'3306',
                    //          senha:'Nileduz',
                    //          usuario:'intersig'
                    //         }, databases: databases   , databaseName:String(nomeBanco), pathZip:"C:/backups-api/IC" })
                                    
    }

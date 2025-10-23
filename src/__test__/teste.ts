import { createClientPoolConnection } from "../database/mysql-create-pool.ts";

                             
                             const conn = await createClientPoolConnection('192.168.100.106', "Nileduz",'intersig', String(3306));
    if(conn){
        const nomeBanco = 'eletroinga';

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
                                        ) ;`) ;
                                    console.log(results)
    }

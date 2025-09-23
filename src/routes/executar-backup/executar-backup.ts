import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/client.ts";
import { clientes } from "../../database/schema.ts";
import { eq } from "drizzle-orm";
import { execBackup  } from "../../services/exe-backup.ts";
import { createClientPoolConnection } from "../../database/mysql-create-pool.ts";


type resultDatabase =  { database_name: string } 


export const executarBackup: FastifyPluginAsyncZod = async ( server ) =>{
    server.post('/executar-backup/:codigo', {
        schema:{
            tags: ["executar-backup"],
            summary:'Executar backup do cliente',
            params : z.object({
                codigo:z.string().describe('codigo do cliente a ser executado o backup')
            })
        }
    }, 
    async ( request, reply )=>{
             const { codigo } = request.params
     
        const selectedClientBackup = await db.select().from(clientes).where( eq(clientes.codigo, Number(codigo) ))
                if( selectedClientBackup.length > 0    ){
                    if( selectedClientBackup[0].efetuar_backup && selectedClientBackup[0].efetuar_backup =='S' ){

                 const dataClient = selectedClientBackup[0]
                 const { host, usuarioMysql, senhaMysql, portaMysql , nomeBanco } = dataClient ;
                 const conn = await createClientPoolConnection(host,senhaMysql, usuarioMysql, String(portaMysql) );

                        if( conn !== null ){
                            if(!host || !usuarioMysql || !senhaMysql || !portaMysql  ||  !nomeBanco){
                              reply.status(400).send({ msg: "Verifique o cadastro cliente, um ou mais parametros não foram encontrados"})
                            }
                            
                            try{

                                    const [ results, fields  ] = await conn.query(`SELECT schema_name as database_name
                                                    FROM information_schema.schemata
                                                    WHERE schema_name LIKE '%${nomeBanco}%';`)
                                            
                                                    const resultDatabases = results as resultDatabase[];


                                                if(resultDatabases.length > 0 ){

                                                        const databases: string[] = []
                                                        resultDatabases.forEach((db)=>{
                                                            databases.push(db.database_name)
                                                        })

                                                    reply.status(202).send({ msg: 'backup iniciado ' })  
                                                    const config  = {
                                                        host: dataClient.host,
                                                        porta: String(dataClient.portaMysql),
                                                        senha: dataClient.senhaMysql,
                                                        usuario: dataClient.usuarioMysql
                                                    }
                                                    await execBackup(Number(codigo), config, databases,  String(nomeBanco))

                                                }
                                
                                }catch(e){
                                console.log(e)
                                return reply.status(500).send({ msg: e })
                            }finally{
                                if (conn) {
                                        conn.release(); // Libera a conexão de volta ao pool
                                    }
                            }
                        }
                    }else{
                        reply.status(401).send({msg: `o cliente nao esta autorizado para executar backup`})
                    }
                } else{
                    reply.status(400).send({msg: `Cliente codigo  ${codigo} não foi encontrado `})
                }

            }  
    )
}
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { createClientPoolConnection } from "../../database/mysql-create-pool.ts";
import { db } from "../../database/client.ts";
import { clientes } from "../../database/schema.ts";
import { eq } from "drizzle-orm";
import {  type PoolConnection } from "mysql2/promise";

type objectDatabase = { database: string }

interface resultDatabase   { Database: string } 

export const getDatabases :FastifyPluginAsyncZod = async ( server )=>{
        server.get('/databases',{
            schema:{
                tags:['databases'],
                summary:'obtem os bancos de dados de um host',
                querystring: z.object({
                    host: z.string()
                }),
                 response:{
                  //  200: z.object({
                  //      databases: z.array(
                  //       z.object({
                  //                 database: z.string()
                  //          }).nullable()
                  //      )
                  //  })
                 }
            }
        }, async ( request, reply )=>{
            const {  host } = request.query;
            const arrDataClient = await db.select().from(clientes).where( eq(clientes.host , host ) )
                if(arrDataClient.length > 0 ){
                    const { host, usuarioMysql, senhaMysql, portaMysql } = arrDataClient[0];
                const conn = await createClientPoolConnection(host,senhaMysql, usuarioMysql, String(portaMysql) );

                    if( conn !== null ){
                        try{
                                const [ results, fields  ] = await conn.query(`SHOW DATABASES;`)
                                console.log(results)
                                    const databasesResult = results as resultDatabase[]

                                 if( results  && Array.isArray(results)  ){
                                    const databases : objectDatabase[] =[]
                                     databasesResult.map(( i )=>{
                                          if(i.Database){
                                            databases.push(  { database: String(i.Database)})
                                            }
                                        }) 

                                    reply.send(databases)
                                }
                                 
                            }catch(e){
                            console.log(e)
                        }finally{
                            if (conn) {
                                    conn.release(); // Libera a conexão de volta ao pool
                                }
                        }
                    } 
                }
        })
}

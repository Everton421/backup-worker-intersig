import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z  from "zod";
import { db } from "../../database/client.ts";
import { clientes } from "../../database/schema.ts";
import { eq, SQL } from "drizzle-orm";
import { checkRequest } from "../../hooks/check-request-jwt.ts";
import { checkUser } from "../../hooks/check-user-jwt.ts";


export const pathCliente:FastifyPluginAsyncZod = async (server )=>{
    server.patch('/clientes/:codigo', {
          preHandler:[
                    checkRequest,
                    checkUser('suport') 
                ],
        schema:{
            tags: ['clientes'],
                 headers: z.object({
                                    authorization: z.string()
                             }),
            params: z.object({
                codigo:z.string()  
            }),
            body: z.object({
                hora_agenda_backup: z.string().optional(),
                efetuar_backup: z.enum([ 'S','N']).optional(),
                senhaMysql: z.string().optional(),
                portaMysql: z.string().optional(),
                usuarioMysql: z.string().optional(),
                acesso: z.enum([ 'L','B', 'A']).optional(),
                host: z.string().optional(),
                nomeBanco: z.string().optional()

            }),
            response:{
                200:z.object(),
                400: z.object(),
                500: z.object()
            }
        },
    },
 async ( request, reply )=>{

        const {portaMysql, acesso, efetuar_backup, hora_agenda_backup, host,nomeBanco,  senhaMysql,usuarioMysql  } = request.body
        const {  codigo } = request.params

            let porta 
            if(portaMysql !== undefined ){
                porta = Number(portaMysql)
            }
 
                const values  =
                 { 
                    acesso: acesso,
                    efetuar_backup: efetuar_backup,
                    hora_agenda_backup: hora_agenda_backup,
                    portaMysql:  porta  ,
                    senhaMysql: senhaMysql,
                    usuarioMysql: usuarioMysql,
                    host:host,
                    nomeBanco: nomeBanco
                 }

                 const validateClient = await db.select().from(clientes).where(eq(clientes.codigo, Number(codigo)))

                 if(validateClient.length === 0 ){
                    console.log("Nao foir encontrado cliente codigo:", codigo)
                    reply.status(400);
                 }

                 try{
                    const resultUpdate = await db.update(clientes)
                     .set( values )
                     .where( eq(clientes.codigo, Number(codigo) )) 
                     
                     if( resultUpdate && resultUpdate[0].affectedRows > 0 ){
                            reply.status(200);
                      }  
                    
                    }catch(e){
                        console.log("Erro ao atualizar cliente ",e)
                        reply.status(500);
                     }
                  
                    }
    )
}   
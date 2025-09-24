import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/client.ts";
import { users } from "../../database/schema.ts";
import { eq } from "drizzle-orm";

export const getUserById : FastifyPluginAsyncZod = async ( server ) =>{
     server.get('/usuarios/:id',{
         schema:{
            tags: ['usuarios'],
            params: z.object({
                id: z.string()
            }),
            response:{
                 200: z.object({
                    usuario:  
                        z.object(
                            {      id: z.number(),
                                  email_user:z.string().nullable(),
                                  nome_user: z.string().nullable(),

                           })
                     
                 }),
                 400:z.object()
            }
         }
     }, async  (request , reply )=>{
        const { id } = request.params
        const usuario = await db.select({ id: users.id,nome_user: users.nome_user, email_user: users.email_user }).from(users).where( eq( users.id, Number(id)))
         if(usuario.length === 0 ){
             return reply.status(400)
         }

        return reply.status(200).send({  usuario: usuario[0] })
     } ) 
}
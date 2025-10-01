import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/client.ts";
import { users } from "../../database/schema.ts";
import { checkRequest } from "../../hooks/check-request-jwt.ts";
import { checkUser } from "../../hooks/check-user-jwt.ts";

export const getUsers : FastifyPluginAsyncZod = async ( server ) =>{
     server.get('/usuarios',{
          preHandler:[
                    checkRequest,
                    checkUser('suport') 
                ],
         schema:{
            tags: ['usuarios'],
               headers: z.object({
                                      authorization: z.string()
                  }),
            response:{
                 200: z.object({
                    usuarios: z.array(
                        z.object(
                            {      id: z.number(),
                                  email_user:z.string().nullable(),
                                  nome_user: z.string().nullable(),

                           })
                    )
                 }),
                 400:z.object({})
            }
         }
     }, async  (request , reply )=>{

        const responseUsers = await db.select({ id: users.id,nome_user: users.nome_user, email_user: users.email_user }).from(users)
        if(responseUsers.length === 0 ){
            return reply.status(400)
        }

        return reply.status(200).send({ usuarios: responseUsers})
     } ) 
}
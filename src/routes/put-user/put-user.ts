import  type { FastifyPluginAsyncZod }  from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/client.ts";
import { users } from "../../database/schema.ts";
import { eq } from "drizzle-orm";
import { hash } from "argon2";

export const putUser: FastifyPluginAsyncZod = async ( server )=>{
    server.put('/usuarios/:id',{
        schema:{
            tags:[ 'usuarios'],
            querystring: z.object({
                id: z.number()
            }),
            body: z.object({
                email: z.string(),
                senha: z.string(),
                nome: z.string()
            }),
            response: {
                201: z.object({
                }),
                400: z.object({ msg: z.string() })
            }
        } ,
    }, async ( request, reply  )=>{

        const { email,  nome, senha } = request.body
        const  { id } = request.query
        
        const verifyuser = await db.select().from(users).where(eq( users.id , id))

        if( verifyuser.length === 0 ) return reply.status(400).send({ msg:"não existe usuario com este email"}) 
        
            const hasPassword = await hash(senha)
        
            const resultUpdate = await db.update(users)
            .set({ email_user: email, senha_user: hasPassword, surname: nome, nome_user: nome})
            .where(eq( users.email_user, email ))
    
                if(resultUpdate.length > 0 && resultUpdate[0].affectedRows > 0  ){
                    return reply.status(201)
                }
 
        })  

}
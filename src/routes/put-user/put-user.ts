import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/client.ts";
import { users } from "../../database/schema.ts";
import { eq } from "drizzle-orm";
import { hash } from "argon2";
import { checkRequest } from "../../hooks/check-request-jwt.ts";
import { checkUser } from "../../hooks/check-user-jwt.ts";

export const putUser: FastifyPluginAsyncZod = async (server) => {
    server.put('/usuarios/:id', {
        preHandler: [
             checkRequest,
             checkUser('suport')
        ],
        schema: {
            tags: ['usuarios'],
            headers: z.object({
                authorization: z.string()
            }),
            params: z.object({
                id: z.string()
            }),
            body: z.object({
                email: z.string(),
                senha: z.string(),
                nome: z.string()
            }),
             response: {
                 200: z.object({
                 }),
                 400: z.object({ msg: z.string() })
             }
        },
    }, async (request, reply) => {
        const { email, nome, senha } = request.body
        const { id } = request.params


        const verifyuser = await db.select().from(users).where(eq(users.id, Number(id)))
 
           const hasPassword = await hash(senha)

           if (verifyuser.length > 0) {

                    const resultUpdate = await db.update(users)
                        .set({ email_user: email, senha_user: hasPassword, user_name: nome })
                        .where(eq(users.id,  verifyuser[0].id ))
                        return reply.status(200).send()
                        
           }else{
              return reply.status(400).send({ msg: "nao existe usuario com este codigo" })
           }

//

    })

}
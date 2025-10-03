import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/client.ts";
import { users } from "../../database/schema.ts";
import { eq } from "drizzle-orm";
import { hash } from "argon2";
import jwt from "jsonwebtoken"
import { checkRequest } from "../../hooks/check-request-jwt.ts";
import { checkUser } from "../../hooks/check-user-jwt.ts";

export const postUser: FastifyPluginAsyncZod = async (server) => {
    server.post('/usuarios', {
        preHandler: [
            checkRequest,
            checkUser('suport')
        ],
        schema: {
            tags: ['usuarios'],
            headers: z.object({
                authorization: z.string()
            }),
            body: z.object({
                email: z.string(),
                senha: z.string(),
                nome: z.string()
            }),
            response: {
                201: z.object({
                    token: z.string()
                }),
                400: z.object({ msg: z.string() })
            }
        },
    }, async (request, reply) => {

        const { email, nome, senha } = request.body

        const verifyuser = await db.select().from(users).where(eq(users.email_user, email))
        if (verifyuser.length > 0) return reply.status(400).send({ msg: "Já existe um usuario com este email" })
        const hasPassword = await hash(senha)
        const resultInsert = await db.insert(users).values({ email_user: email, senha_user: hasPassword, user_name: nome, type: 'suport'  })

        console.log(resultInsert)

        if (!process.env.JWT_SECRET) {
            throw new Error(" JWT_SECRET Não configurado.")
        }

        const token = jwt.sign(
            { user: nome },
            process.env.JWT_SECRET
        )
        return reply.status(201).send({ token: token })

    })

}
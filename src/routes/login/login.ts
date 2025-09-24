import { type  FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/client.ts";
import { users } from "../../database/schema.ts";
import z, { email } from "zod";
import { eq } from "drizzle-orm";
import { verify } from "argon2";
import   jwt  from 'jsonwebtoken'

export const loginRoute : FastifyPluginAsyncZod = async ( server )=> {
    server.post('/login', {
        schema: { 
            tags:['login'],
            body: z.object({
                email: z.string(),
                senha: z.string()
            })

        }
     }, async ( request, reply )=>{
            const { email, senha } = request.body
                const result = await db.select().from( users ).where( eq(users.email_user, email ) );

                if( result.length  ===  0 ){
                        return reply.status(400).send({ msg: "Credenciais invalidas."})
                }

                const user = result[0]
                    
                    if(!user.senha_user ){
                        return reply.status(400).send({ msg: "Credenciais invalidas."})
                    }

                const verifyPassword = await verify( user.senha_user, senha )
                     if(!verifyPassword ){
                        return reply.status(400).send({ msg: "Credenciais invalidas."})
                    }
                

                if(!process.env.JWT_SECRET ){
                    throw new Error(" JWT_SECRET não configurado")
                }

                const token = jwt.sign(
                    { user: user.nome_user },
                    process.env.JWT_SECRET
                )
                return reply.status(200).send({ token })


    })
}
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/client.ts";
import { clientes } from "../../database/schema.ts";
import { and, asc, eq, ilike, like, or, SQL, sql } from "drizzle-orm";
import z from "zod";
import { checkRequest } from "../../hooks/check-request-jwt.ts";
import { checkUser } from "../../hooks/check-user-jwt.ts";

export const getClientesPorCodigo : FastifyPluginAsyncZod= async (server)=>{
    server.get('/clientes/:codigo', {
        preHandler:[
                  checkRequest,
                  checkUser('suport') 
              ],
        schema:{ 
            tags:['clientes'],
               headers: z.object({
                                      authorization: z.string()
                                  }),
            params: z.object({
              codigo: z.string(),
            }),

        }

    }, async ( request, reply)=>{
       
        const {  codigo  } = request.params

      const client = await 
        db.select()
        .from(clientes)
         .where( sql`${clientes.ativo} =  'S' AND ${clientes.codigo} = ${codigo} `  )

        if( client .length > 0 ){
           return reply.send( { cliente: client }  );
        } 

    })
}
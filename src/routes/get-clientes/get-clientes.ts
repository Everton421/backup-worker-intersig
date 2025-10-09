import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/client.ts";
import { clientes, efetuarBackup } from "../../database/schema.ts";
import { and, asc, desc, eq, ilike, like, or, SQL, sql } from "drizzle-orm";
import z from "zod";
import { checkRequest } from "../../hooks/check-request-jwt.ts";
import { checkUser } from "../../hooks/check-user-jwt.ts";

export const getClientes : FastifyPluginAsyncZod= async (server)=>{
    server.get('/clientes', {
        preHandler:[
            checkRequest,
            checkUser('suport') 
        ],
        schema:{ 
             tags:['clientes'],
           headers: z.object({
                          authorization: z.string()
                      }),
             querystring: z.object({
              search: z.string().optional(),
              acesso: z.enum(['A', 'L', 'B']).optional(),
              efetuar_backup: z.enum([ 'S','N']).optional(),
              orderBy: z.enum(['codigo', 'nomeFantasia','razaoSocial', 'efetuar_backup','data_ultimo_backup', 'hora_agenda_backup']).optional().default('codigo'),
              groupBy: z.enum(['codigo', 'ip', 'host','nomeBanco']).default('codigo'),
              host: z.string().optional(),
              ativo: z.enum(['S','N']).optional().default('S'),

            }),
        }

    }, async ( request, reply)=>{
       
       

        const { orderBy, ativo, acesso,   search, groupBy, host, efetuar_backup } = request.query
        
        const conditions:SQL[] =[]; 
       
        if (search) {
            const searchTerm = `%${search}%`;
            const searchConditions = or(
                like(clientes.nomeFantasia, searchTerm),
                like(clientes.razaoSocial, searchTerm),
                like(clientes.cnpj, searchTerm),
                like(clientes.ip, searchTerm),
                like(clientes.host, searchTerm)
            );

            if (searchConditions) {
                conditions.push(searchConditions);
            }
        }

        if (host) {
            conditions.push(eq(clientes.host, host));
        }
        if( ativo){
            conditions.push(eq(clientes.ativo, ativo));
        }

        if(acesso){
            conditions.push(eq(clientes.acesso, acesso));
        }
        if (efetuar_backup) {
            conditions.push(eq(clientes.efetuar_backup, efetuar_backup));
        }

       
            
      const clients = await 
        db.select()
         .from(clientes)
         .where( conditions.length > 0 ? and(...conditions) : undefined )  // Use 'and' and handle empty conditions
         .groupBy( clientes[groupBy] )
         .orderBy( desc( clientes[orderBy]))
        

         if( clients.length > 0 ){
            return reply.status(200).send( { clientes:clients} );
         } 

    })
}
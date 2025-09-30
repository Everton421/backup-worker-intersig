import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../database/client.ts";
import { clientes } from "../../database/schema.ts";
import { and, asc, eq, ilike, like, or, SQL, sql } from "drizzle-orm";
import z from "zod";

export const getClientes : FastifyPluginAsyncZod= async (server)=>{
    server.get('/clientes', {
        schema:{ 
             tags:['clientes'],
            querystring: z.object({
              search: z.string().optional(),
              efetuar_backup: z.enum([ 'S','N']).optional(),
              orderBy: z.enum(['codigo', 'nomeFantasia','razaoSocial', 'efetuar_backup','data_ultimo_backup']).optional().default('codigo'),
              groupBy: z.enum(['codigo', 'ip', 'host']).default('codigo'),
              page: z.coerce.number().optional().default(1),
              host: z.string().optional(),
            }),
        }

    }, async ( request, reply)=>{
       
        const { orderBy, page, search, groupBy, host, efetuar_backup } = request.query
        
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
    
        if (efetuar_backup) {
            conditions.push(eq(clientes.efetuar_backup, efetuar_backup));
        }
      
            
      const clients = await 
        db.select()
         .from(clientes)
         .where( conditions.length > 0 ? and(...conditions) : undefined )  // Use 'and' and handle empty conditions
         .groupBy( clientes[groupBy] )
         .orderBy( asc( clientes[orderBy]))
        

         if( clients.length > 0 ){
            return reply.status(200).send( { clientes:clients} );
         } 

    })
}
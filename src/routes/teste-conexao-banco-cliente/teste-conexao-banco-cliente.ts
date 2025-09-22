import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import mysql2 from 'mysql2/promise'

 export const testeConexaoBanco: FastifyPluginAsyncZod = async ( server )=>{
    server.post('/conexao/teste', {
        schema:{
            tags:['conexao-banco'],
            summary:'teste conexao',
            body: z.object({
                host:z.string(),
                porta:z.string(),
                usuario:z.string(),
                senha:z.string()
            }),
            response:{
                200: z.object({  ok: z.boolean() , msg: z.string() }),
                400: z.object({  erro: z.boolean() , msg: z.string() }) 
            }
        }
      },
    async ( request , reply )=>{

        const {  
            host,
            porta,
            usuario,
            senha
        } = request.body

            let pool: mysql2.Pool | undefined;
            let connection: mysql2.PoolConnection | undefined;

          pool = mysql2.createPool({
            host: String(host),
            password: String(senha),
            port: Number(porta),
            user:usuario,
            connectTimeout: 40000,  
            connectionLimit: 5,
        })  

        try{
              connection  = await pool.getConnection();
            const [ rows] = await connection.execute(' SELECT 1 ')
                console.log("Consulta de teste executada", rows );
                return reply.status(200).send({ ok:true, msg:"Conexao efetuada com sucesso!"})
        }catch(e){
            console.log('erro ao tentar conectar no banco ',e )
                return reply.status(400).send({ erro:true,  msg:`Falha ao tentar fazer a conexao! ${e}`})

        }finally{
             if (connection) {
                    connection.release(); // Libera a conexão de volta ao pool
                }
                if (pool) {
                    await pool.end(); // Destrói o pool e fecha todas as conexões
                }
        }

    }
)

 } 

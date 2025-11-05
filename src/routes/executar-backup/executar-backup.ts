import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../database/client.ts";
import { clientes } from "../../database/schema.ts";
import { eq } from "drizzle-orm";
import { execBackup } from "../../services/exe-backup.ts";
import { createClientPoolConnection } from "../../database/mysql-create-pool.ts";
import { checkRequest } from "../../hooks/check-request-jwt.ts";
import { checkUser } from "../../hooks/check-user-jwt.ts";


type resultDatabase = { database_name: string }

export const executarBackup: FastifyPluginAsyncZod = async (server) => {
    server.post('/executar-backup/:codigo', {
        preHandler: [
            checkRequest,
            checkUser('suport')
        ],
        schema: {
            tags: ["executar-backup"],
          
            params: z.object({
                codigo: z.string().describe('codigo do cliente a ser executado o backup')
            }),
               headers: z.object({
                 authorization: z.string()
             }),
            response: {
                200: z.object({ msg: z.string() }),
                401: z.object({ msg: z.string(`o cliente nao esta autorizado para executar backup`) }),
                400: z.object({ msg: z.string() }),
                500: z.object({ msg: z.string() }),
            }
        }
    },
        async (request, reply) => {
            const { codigo } = request.params

            const selectedClientBackup = await db.select().from(clientes).where(eq(clientes.codigo, Number(codigo)))
            if (selectedClientBackup.length > 0) {
                if (selectedClientBackup[0].efetuar_backup && selectedClientBackup[0].efetuar_backup == 'S') {

                    const dataClient = selectedClientBackup[0]
                    const { host, usuarioMysql, senhaMysql, portaMysql, nomeBanco, codigo , caminhoBkp, nomeReduz } = dataClient;
                    const conn = await createClientPoolConnection(host, senhaMysql, usuarioMysql, String(portaMysql));

                    if (conn !== null) {
                        if (!host || !usuarioMysql || !senhaMysql || !portaMysql || !nomeBanco) {
                           return reply.status(400).send({ msg: "Verifique o cadastro cliente, um ou mais parametros não foram encontrados" })
                        }

                        try {

                                        const databasePublico = nomeBanco+'_publico';
                                       const databaseVendas  = nomeBanco+'_vendas';
                                       const databaseFinanceiro  = nomeBanco+'_financeiro';
                                       const databaseEstoque  = nomeBanco+'_estoque';
   
                                       const [results] = await conn.query(`SELECT schema_name as database_name FROM information_schema.schemata WHERE schema_name IN 
                                           ( 
                                           '${databasePublico}',
                                           '${databaseVendas}',
                                           '${databaseFinanceiro}',
                                           '${databaseEstoque}'
                                           ) ;`) as [resultDatabase[], any];

                            const resultDatabases = results as resultDatabase[];

                            if (resultDatabases.length > 0) {
                                const databases: string[] = []
                                resultDatabases.forEach((db) => {
                                    databases.push(db.database_name)
                                })

                                reply.status(200).send({ msg: 'backup iniciado ' })
                                const config = {
                                    host: dataClient.host,
                                    porta: String(dataClient.portaMysql),
                                    senha: dataClient.senhaMysql,
                                    usuario: dataClient.usuarioMysql
                                }

                                let backupFoder = caminhoBkp || nomeBanco || nomeReduz
                                   
                                         await execBackup(Number(codigo), config, databases, String(nomeBanco), backupFoder  );
                            }

                        } catch (e) {
                            console.log(e)
                            return reply.status(500).send({ msg: `Erro ao tentar executar o backup ${e}` })
                        } finally {
                            if (conn) {
                                conn.release(); // Libera a conexão de volta ao pool
                            }
                        }
                    }else{
                              await db.update(clientes)
                               .set(  { status_backup: 'pendente',  msg_backup:"Erro ao tentar se conectar com o host" })
                               .where(eq(clientes.codigo, codigo ))
                             }
                } else {
                    reply.status(401).send({ msg: `o cliente nao esta autorizado para executar backup` })
                }
            } else {
                reply.status(400).send({ msg: `Cliente codigo  ${codigo} não foi encontrado ` })
            }

        }
    )
}
import fastify from "fastify";
import { getClientes } from "./routes/get-clientes/get-clientes.ts";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler,type  ZodTypeProvider } from "fastify-type-provider-zod";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifySwagger from "@fastify/swagger";
import  scalarApiReference from '@scalar/fastify-api-reference';
import { getClientesPorCodigo } from "./routes/get-client-codigo/get-clientes-codigo.ts";
import { testeConexaoBanco } from "./routes/teste-conexao-banco-cliente/teste-conexao-banco-cliente.ts";
import { executarBackup } from "./routes/executar-backup/executar-backup.ts";
import { getDatabases } from "./routes/get-databases/get-databases.ts";

const server = fastify(
    {
         logger: false
           
             
           
         }
).withTypeProvider<ZodTypeProvider>()

server.register( fastifySwagger,{
    openapi:{
        info:{
        title:"intersig",
        version:'1.0.0'
        }
    },
    transform: jsonSchemaTransform
})
server.register( scalarApiReference,{
    routePrefix: '/docs',
})

 server.setSerializerCompiler(serializerCompiler )

 server.setValidatorCompiler(validatorCompiler)


server.register(getClientes)
server.register(getClientesPorCodigo)

server.register(testeConexaoBanco)

server.register(executarBackup);
server.register(getDatabases);


export {server }
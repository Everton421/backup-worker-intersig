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
import fs from  'node:fs' ;
import path from 'node:path'
import { loginRoute } from "./routes/login/login.ts";
import { postUser } from "./routes/post-user/post-user.ts";
import { putUser } from "./routes/put-user/put-user.ts";
import { getUsers } from "./routes/get-user/get-user.ts";
import { getUserById } from "./routes/get-user-id/get-user-id.ts";
import cors from '@fastify/cors'

    let certPathEnv ; 
    if(process.env.PATH_CERT){
          certPathEnv  = String(process.env.PATH_CERT) 
    }

    let keyPathEnv;
    if(process.env.PATH_KEY){
          keyPathEnv  = String(process.env.PATH_KEY) 
    }



    let httpsOptions={}

 if( process.env.NODE_ENV === 'production' && keyPathEnv && certPathEnv ){
        const keyPath = path.join(keyPathEnv );
        const certPath = path.join(certPathEnv);

        httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
         }
      }


const server = fastify(
        {
           logger: false,
            //https:httpsOptions
         }
).withTypeProvider<ZodTypeProvider>()

  server.register(cors,{
      origin:'*',
      methods: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      allowedHeaders: '*',
      credentials: true,
  })

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
server.register(loginRoute);
server.register(postUser);
server.register(putUser)
server.register(getUsers)
server.register(getUserById)

export {server }
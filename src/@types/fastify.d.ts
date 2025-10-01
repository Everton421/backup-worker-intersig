import fastify from "fastify"
declare module "fastify" { 
    interface FastifyRequest { 
        user?:{
         type: 'suport'
        }
    }
}
import type { FastifyReply, FastifyRequest } from "fastify";


export function checkUser(typeUser : 'suport'){
    return async function  ( request: FastifyRequest, reply: FastifyReply)  {
            const { user } = request 
        if(!user || !user?.type){
            return reply.status(401).send()
        }
        if(  user?.type !== typeUser){
            return reply.status(401).send()
        }
    }   
}
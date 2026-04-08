import mysql from 'mysql2/promise'

    /**
     * 
     * @param host host do banco de dados
     * @param senha senha do banco de dados
     * @param usuario usuario do banco de dados
     * @param porta porta do banco de dados
     * @returns 
     */
  export   async function createClientPoolConnection( host: string, senha:string, usuario:string, porta:string ){

               const conn = await  mysql.createPool({
                    connectionLimit : 10,
                    host: host,
                    user: String(usuario),
                    port: Number(porta),
                    password: String(senha),
                })
                return conn
        }
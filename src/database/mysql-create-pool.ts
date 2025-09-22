import mysql2 from 'mysql2/promise'

    /**
     * 
     * @param host host do banco de dados
     * @param senha senha do banco de dados
     * @param usuario usuario do banco de dados
     * @param porta porta do banco de dados
     * @returns 
     */
  export   async function createClientPoolConnection( host: string, senha:string, usuario:string, porta:string ){

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
                    return connection
            }catch(e){
                console.log('erro ao tentar conectar no banco ',e )
                    return null
            }
        }
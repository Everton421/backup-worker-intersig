import { createClientPoolConnection } from "../database/mysql-create-pool.ts";


const conn= await createClientPoolConnection("192.168.100.106a", "Nileduz", "intersig", "3306");
    
    let statusResultQuery= { sucess:false , message:''};
    try{

        const  [rows]   = await conn.query(' SELECT 1 ') as any[];
            console.log(rows)
        statusResultQuery.sucess= true
    }catch(e ){
        statusResultQuery.sucess= false
    statusResultQuery.message = String(e); 
    }
               console.log(statusResultQuery)
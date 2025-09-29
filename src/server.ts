import { server } from "./app.ts";
import { mainTask } from "./services/auto-exe-backup.ts";


    let port = 3000
    if( process.env.PORT_API ){
          port = Number( process.env.PORT_API ) 
    }
    
mainTask()

  
    server.listen( { port: port, host: '0.0.0.0'  } ,()=>console.log(` Server is running port ${port} `))

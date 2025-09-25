import { server } from "./app.ts";


    let port = 3000
    if( process.env.PORT_API ){
          port = Number( process.env.PORT_API ) 
    }


  
    server.listen( { port: port } ,()=>console.log(` Server is running port ${port} `))

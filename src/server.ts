import { server } from "./app.ts";


    let port = 3000
    if( process.env.PORT_API ){
          port = Number( process.env.PORT_API ) 
    }


  
    server.listen( { port: port , host: '0.0.0.0' } ,()=>console.log(` Serve is running post ${port} `))
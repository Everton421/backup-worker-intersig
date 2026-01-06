import { server } from "./app.ts";
import {  jobBackup } from "./jobs/backup-job.ts";
import { deleteZipFilesJob } from "./jobs/delete-arquivos-zip-job.ts";
import { consumeBackupMessages } from "./utils/consume-backup-message.ts";


    let port = 3000
    if( process.env.PORT_API ){
          port = Number( process.env.PORT_API ) 
    }

 await deleteZipFilesJob();
    
 await jobBackup();
    
  consumeBackupMessages().catch(console.error);
  
    server.listen( { port: port, host: '0.0.0.0'  } ,()=>console.log(` Server is running port ${port} `))

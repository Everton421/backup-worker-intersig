 
 import path,{ dirname} from "node:path"
 import fs from 'node:fs'
import { createDirectory } from "../utils/create-directory.ts"

 //console.log( fs.existsSync(process.env.PATH_BACKUPS))
        let pathBackups = 'C:/backups-api'
        let pathZip = 'IA'

            let pathzipComplete = path.resolve(pathBackups,pathZip)
  

           //if( !fs.existsSync(pathBackups )){
             //    createDirectory(pathBackups );
             //}
//
             if( !fs.existsSync(pathzipComplete )){
            console.log("diretorio nao existe", pathzipComplete) 
               createDirectory(pathzipComplete );

              }else{
              }

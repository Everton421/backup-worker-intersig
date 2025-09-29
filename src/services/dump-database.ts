import fs from 'fs'
import { execFile , spawn} from 'child_process';
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'; // Importe para usar o import.meta.url

    type mysqlConfig = {
        host:string,
        porta:string,
        usuario:string,
        senha:string
    }

type resultDumpDatabase = {
        ok:boolean
        msg:string
}


 export function dumpDatabase( mysqlConfig:mysqlConfig, dbName:string , id:string ) :Promise<resultDumpDatabase>{

      const __dirname = dirname(fileURLToPath(import.meta.url))
    
            const pathTemp = path.resolve(__dirname,`../../temp/${dbName}-${id}.sql`)  
        
    const pathMysqlDump = path.resolve(__dirname,'../../mysqldump.exe') // Use path.resolve para caminho absoluto

        return new Promise( (resolve, reject)=>  {

            const mysqldump = spawn(pathMysqlDump, [
            `--host=${mysqlConfig.host}`,
            `--user=${mysqlConfig.usuario}`,
            `--password=${mysqlConfig.senha}`,
            '--column-statistics=0',
            `--databases`,
            dbName,
            ]);

            const fileStream = fs.createWriteStream(pathTemp);

            mysqldump.stdout.pipe(fileStream);  // Redireciona a saída para o arquivo

       
            mysqldump.on('close', (code) => {
            if (code === 0) {
                console.log(`Backup de ${dbName} concluído com sucesso.`);
                resolve({ ok:true, msg:`Backup de ${dbName} concluído com sucesso.`});
            } else {
                 const error = new Error(`mysqldump process exited with code ${code}`);
                 reject({ok:false, msg:`Erro ao tentar efetuar o backup ${error}`});
            }
            });

            mysqldump.on('error', (err) => {
            console.error('Falha ao iniciar o processo mysqldump.', err);
                reject({ok:false, msg:`Falha ao iniciar o processo mysqldump ${err}`});
            });
        });

}


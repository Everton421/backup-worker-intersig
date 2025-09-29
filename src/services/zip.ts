import  path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip'; // Importe o módulo adm-zip
import fs from 'node:fs'
/**
 * Compacta os arquivos do diretório temporário para um arquivo zip.
 * @param zipName Nome completo do arquivo zip de saída (incluindo o caminho).
 * @returns Uma Promise que resolve com um objeto indicando sucesso ou falha.
 */
export function zipBackup(zipName: string, databases:string[], id: string): Promise<{ erro: boolean; msg: string }> {
    return new Promise( async (resolve, reject) => {
            
        try {
      
      const __dirname = dirname(fileURLToPath(import.meta.url))
             const tempPath = path.resolve(__dirname, '../../temp');
            


        
           const files = await fs.promises.readdir(tempPath);
            const zip = new AdmZip();

          for( const file of files ){
                
              //// Adiciona todos os arquivos do diretório temporário ao arquivo zip
              //  const filePath = path.join(tempPath, file)
                  for(const dbName of databases){
                     const filenameTozip = `${dbName}-${id}.sql`; 
                    if(file === filenameTozip){
                        const filePath = path.join(tempPath, file);
                        zip.addLocalFile( filePath );
                      }

                // Escreve o arquivo zip no caminho especificado
                    zip.writeZip(zipName);
            }
          }
            resolve({ erro: false, msg: 'Backup compactado com sucesso.' });

        
        } catch (error) {
            console.error('Erro ao compactar o backup:', error);
            reject({ erro: true, msg: 'Erro ao compactar o backup:', error });
        }
    });
}


/// old function
/**
  
import { execFile , spawn} from 'child_process';
 
import { fileURLToPath } from 'url'; // Importe para usar o import.meta.url
import path, { dirname } from 'path'

 
export function zipBackup(zipName:string  )    {

    const __filename = fileURLToPath("file:///C:/Users/usuario/Desktop/apps/api-backup/src/services/zip.ts");
    const __dirname = path.dirname(__filename);
    const zipPath = path.resolve(__dirname,'../../backups')
    const tempPath = path.resolve(__dirname,'../../temp')

  return new Promise((resolve, reject) => {
    // Comando para adicionar todos os arquivos do diretório DESTINO_BACKUP ao arquivo zip
    execFile(
      zipPath,
      ['a', '-tzip', zipName, path.join(tempPath, '*')], // Adiciona todos os arquivos do diretório
      (error, stdout, stderr) => {
        if (error) {
          console.error('Erro ao compactar o backup:', error);
          console.error('Stderr:', stderr);
          return reject({erro:true, msg: 'Erro ao compactar o backup:', error });
        }
        console.log('Backup compactado com sucesso.');
        resolve( { erro:false, msg:'Backup compactado com sucesso.'});
      }
    );
  });
}

 */
import  path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'node:fs'
import { execFile } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

const tempDir = path.join(__dirname, '../../temp')
const path7zip = path.join(__dirname, '../../7z.exe')


/**
 * 
 * @param zipName Nome completo do arquivo zip de saída (incluindo o caminho).
 * @param fileName 
 */
export async function zipFiles(zipName: string, databases: string[], id: string): Promise<{ erro: boolean; msg: string; error?: any }> {

    const filesToZip: string[] = []; // Array para armazenar os caminhos dos arquivos a serem zipados
    const files = await fs.promises.readdir(tempDir);

    for (const file of files) {
        for (const db of databases) {
            const filenameTozip = `${db}-${id}.sql`
            if (file === filenameTozip) {
                const filePath = path.join(tempDir, file);
                filesToZip.push(filePath); // Adiciona o caminho do arquivo ao array
            }
        }
    }

    if (filesToZip.length === 0) {
        return { erro: true, msg: 'Nenhum arquivo encontrado para compactar.' };
    }

    // Constrói os argumentos para o 7z.exe
    const args = ['a', '-tzip', zipName, ...filesToZip];

    return new Promise((resolve, reject) => { // Use Promise para aguardar o resultado do execFile
        execFile(
            path7zip,
            args,
            (error, stdout) => {
                if (error) {
                    console.error("Erro ao compactar:", error); // Logar o erro para debug
                    resolve({ erro: true, msg: 'Erro ao compactar o backup:', error }); // Resolver a Promise com o erro
                } else {
                    console.log("Compactado com sucesso:", stdout); // Logar o stdout para debug
                    resolve({ erro: false, msg: 'Backup compactado com sucesso.' }); // Resolver a Promise com sucesso
                }
            }
        );
    });


}


/**
 * Compacta os arquivos do diretório temporário para um arquivo zip.
 * @param zipName Nome completo do arquivo zip de saída (incluindo o caminho).
 * @returns Uma Promise que resolve com um objeto indicando sucesso ou falha.
 
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
*/

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
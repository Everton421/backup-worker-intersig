
import { execFile } from 'node:child_process'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'url';
import fs from 'node:fs'
import { randomUUID } from 'node:crypto';
const __dirname = dirname(fileURLToPath(import.meta.url))
const tempDir = path.join(__dirname, '../../temp')

const caminhoDestino = path.join(__dirname, '../../backups')

const path7zip = path.join(__dirname, '../../7z.exe')


/**
 * 
 * @param zipName Nome completo do arquivo zip de saída (incluindo o caminho).
 * @param fileName 
 */
async function zipFiles(zipName: string, databases: string[], id: string): Promise<{ erro: boolean; msg: string; error?: any }> {

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



function createfile(fileName: string, id: string) {
    const newFileName = fileName + '-' + id + '.sql'
    const pathNewFile = path.join(tempDir, newFileName);
    fs.writeFile(pathNewFile, ' teste ', (err) => {
        if (err) {
            console.log("Erro ao tentar gerar arquivo", err)
            return
        }
    })
    return newFileName
}


const zipName = path.join(caminhoDestino, `test.zip`);

async function test() {
    const databases = ['publico', 'vendas', 'estoque']
    const hasDatabases = []
    const id = '1'
   // for (const f of databases) {
   //     hasDatabases.push(createfile(f, id))
   // }

    const nomeZipTest = path.join(caminhoDestino, 'teste.zip')
    let result = await zipFiles(nomeZipTest, databases, id)
    console.log(result)
}

test()


// old functions 
/*
import { execFile } from 'node:child_process'
import path ,{dirname} from 'node:path'
import { stdout } from 'node:process';
import { fileURLToPath } from 'url';
import   fs   from 'node:fs'     
import { randomUUID } from 'node:crypto'; 'node:crypto'
const __dirname = dirname(fileURLToPath(import.meta.url))
const tempDir = path.join(__dirname, '../../temp')

const caminhoDestino =path.join(__dirname,'../../backups') 

const path7zip = path.join(__dirname,'../../7z.exe')
 

/**
 * 
 * @param zipName Nome completo do arquivo zip de saída (incluindo o caminho).
 * @param fileName 
  */
 /*
async function zipFiles(zipName: string, databases: string[], id: string): Promise<{ erro: boolean; msg: string; error?: any }> {

    const files = await fs.promises.readdir(tempDir);

    for (const file of files) {
        for (const db of databases) {
            const filenameTozip = `${db}-${id}.sql`
            if (file === filenameTozip) {
                const filePath = path.join(tempDir, file)
                return new Promise((resolve, reject) => { // Use Promise para aguardar o resultado do execFile
                    execFile(
                        path7zip,
                        ['a', '-tzip', zipName, filePath],
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
        }
    }
    return { erro: true, msg: 'Nenhum arquivo encontrado para compactar.' }; // Retorna se nenhum arquivo corresponder
}


    function createfile (fileName:string, id:string ){
        const newFileName = fileName + '-'+id+ '.sql' 
        const pathNewFile = path.join(tempDir,newFileName);
        fs.writeFile( pathNewFile, ' teste ', ( err ) =>{
            if(err){
                console.log("Erro ao tentar gerar arquivo", err)
                return
            } 
        })
            return newFileName
    }


   const zipName = path.join(caminhoDestino, `test.zip`);

async function test(){
    const databases = [ 'vendas'  ]
    const hasDatabases = []
    const id = '1'
    //for( const f of databases){
    //      hasDatabases.push( createfile(f,id)) 
    //    }

      const nomeZipTest = path.join(caminhoDestino,'teste.zip')
    let result =  await zipFiles(nomeZipTest,  databases,id)
    console.log(result)    
}

 test()
 */
import fs from 'fs'
 
export async function  createDirectory(dirPath:string) {
            await fs.mkdir(dirPath, { recursive: true}, ( err)=>{
                if(err){
                  console.log(`Erro ao tentar criar diretorio  ${err} `)
                }else{
                  console.log(`Diretorio criado ${dirPath} `)
                }
            });
}

import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * 
 * @param pathFile caminho do arquivo a ser verificado
 * @returns 
 */
export async function verifyFile(pathFile:string){
        const pathFileTocheck = path.resolve(pathFile);

        let handle;
        try{
            handle = await fs.open( pathFile,'r+');
            return { erro:false, msg:"O arquivo não esta em uso"}
        }catch(error){  
            console.log(error);
            return { erro:true, msg:error}

        }finally{
            if(handle){
                await handle.close();
            }
        }
}
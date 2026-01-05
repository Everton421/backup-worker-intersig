import { opendir } from "node:fs/promises";
import { stat, rm } from 'node:fs/promises'
import path from 'node:path'

 /**
  * 
  * @param date data ultimo backup executado 
  * @param directory diretorio onde estão os itens a ser validados
  * @param interval intervalo de dias, ( Ex.: interval = 5 será verificado os arquivos com data de criação com 5 dias de antecedencia em relação a data do ultimo backup informada (date)  ) 
 */
 export async function deleteZipFiles( directory:string, date: string, interval:number ){

  try {

    const folder = 'C:/backups-api' 

    const data = new Date(date)  ;

      data.setDate(data.getDate() - interval);

        const fullDirectory = `${folder}/${directory}`

      const dir = await opendir(fullDirectory) as any;
      

    for await (const dirent of dir){

          // if( dirent.isDirectory ){
          //   continue;
          // }
            const filePath = path.join(fullDirectory, dirent.name);
        
            const stats = await stat(filePath);

              const fileCreationDate = stats.birthtime;

            try{
              if( new Date(fileCreationDate) < data ){
                console.log(" Excluindo  arquivo: " ,dirent.name ," ", stats.atime)
                    await rm(filePath, { force: true });
              }

            }catch( e ){
              console.log("Erro ao processar arquivo: ", dirent.name, " ", e);
            }
      }
  } catch (err) {
    return { erro:true, msg:"Ocorreu um erro ao tentar excluir arquivo. ",err}
  }
 }
import { opendir } from "node:fs/promises";
import fs from 'node:fs'

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
          await fs.stat( dirent.path  ,async ( err , stats )=>{
            if( err ){
                console.log(" ERRO: ",err)
            }else{
              console.log( dirent )  
              console.log(`${new Date(stats.atime)} < ${data}`)  

                  if( new Date(stats.atime) <   data    ){
                         console.log(`${new Date(stats.atime)} < ${data}`)  
                         console.log(" Excluindo  arquivo: " ,dirent.name ," ", stats.atime)
                         console.log( dirent )  

                          const   completePath = `${dirent.path}/${dirent.name}` 
                          await fs.rm(completePath,{ force:true }, (err)=>{
                              if (err) console.log("Erro ao tentar excluir arquivo ",err) 
                          } )
                  }
              }
          })
      }
  } catch (err) {
    return { erro:true, msg:"Ocorreu um erro ao tentar excluir arquivo. ",err}
  }
 }
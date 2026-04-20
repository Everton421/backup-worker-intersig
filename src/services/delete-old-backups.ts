import { eq } from "drizzle-orm";
import { clientes } from "../database/schema.ts";
import { deleteZipFiles } from "./delete-arquivos-zip.ts";
import { db } from "../database/client.ts";

export async function deleteOldBackups(){
       try{
               //  const resultClientExecBackup = await db.select().from(clientes).where(eq(clientes.efetuar_backup, 'S' ) );
                  const resultClientExecBackup = await db.select().from(clientes).where(eq(clientes.codigo, 1 ) );
               
                
                    for ( const i of resultClientExecBackup){
               
                        const data_ultimo_backup = i.data_ultimo_backup;
                        const caminhoBkp = i.caminhoBkp
           
                        console.log( `Verificando cliente [ ${i.nomeFantasia} ] | ultimo backup efetuado [ ${i.data_ultimo_backup} ] caminho [ ${caminhoBkp} ] ` );
                          
                            if(!caminhoBkp || caminhoBkp === null || !data_ultimo_backup || data_ultimo_backup === null ){
                                console.log( ` [ caminhoBkp | data_ultimo_backup |  data_ultimo_backup ] não foi configurado para o cliente ${i.nomeFantasia} ` )
                                continue;
                            }
                             
                            await deleteZipFiles(caminhoBkp, data_ultimo_backup, 5  );
                    }
    
            }catch(e){
                console.log("Erro ao tentar executar a tarefa de exclusão de backups")
            }
}
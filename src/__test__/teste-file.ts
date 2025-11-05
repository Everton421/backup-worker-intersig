import { delay } from "../utils/delay.ts";
import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from "node:url";

    const __dirname = dirname( fileURLToPath( import.meta.url))
  const count = 1000;
  const tmpDir = path.join( __dirname,'../../temp','teste.txt')

  for(let i = 1; i <= count ; i++  ){
    await delay(1000)
  const msg = ` escrevendo msg: ${i} ... `
    escrever(msg)
}
function escrever(msg:string){
  fs.writeFile(tmpDir, msg, (err)=>{
    if(err){
      console.log('Erro ao escrever no arquivo ', err );
      return;
    }
  })
}

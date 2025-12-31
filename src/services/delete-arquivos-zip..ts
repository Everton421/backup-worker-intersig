import { db } from "../database/client.ts";
import { clientes } from "../database/schema.ts";

 const  arrClientes = await db.select().from(clientes)

  let data =  arrClientes[0].data_ultimo_backup as any
  data = new Date(data);
 
  const dia = String( data.getDate()).padStart(2, '0');
  const mes = String( data.getMonth()).padStart(2, '0')
  const ano = String( data.getFullYear())
  const ultDate = new Date( data ) ;

  const dataExc = Number(dia) - 5;

//console.log(arrClientes[0])

//console.log(ano,'/', mes ,'/',dia ) 
console.log(ano,'/', mes ,'/',dataExc ) 




import amqp from 'amqplib';
import { execBackup } from '../services/exe-backup.ts';

let rabbitMqUrl = 'amqp://localhost';

const queueName  = 'backup_queue';
if(process.env.RABBITMQ_URL){
    rabbitMqUrl = process.env.RABBITMQ_URL
}

function sleep(ms:number) {
  return new Promise(resolve =>{   
    console.log("aguarde...")
    setTimeout(resolve, ms) });
}
export async function consumeBackupMessages(){

    try{
        const connection = await amqp.connect( rabbitMqUrl,
         );

        const channel = await connection.createChannel();

        await channel.assertQueue( queueName, {
            durable:true 
        });

        console.log("Aguardando mensagens de backup a fila...");

        channel.consume( queueName, async ( msg )=>{
            if(msg){
                const receivedData = JSON.parse(msg.content.toString());
                console.log('[X] mensagem recebida: ', receivedData);
                 const { codigo , config, databases, pathZip, databaseName } = receivedData;
                await execBackup(Number(codigo), config, databases, String(databaseName), pathZip  );
                
                channel.reject(msg, false);
            }
        },{
            noAck: false
        }
    
    )
    }catch(error ){

    }
}

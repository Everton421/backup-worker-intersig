/*
import amqp from 'amqplib'
import { connectRabbitMQ } from '../broker/broker-connection.ts'
 type mysqlConfig = {
        host:string,
        porta:string,
        usuario:string,
        senha:string
    }
  interface Messagebackup {
      codigo: number, 
      config: mysqlConfig,
      databaseName:string ,
      pathZip: string 
      databases:string[] 
}


let rabbitMqUrl = 'amqp://localhost'

if( process.env.RABBITMQ_URL){
    rabbitMqUrl =  process.env.RABBITMQ_URL
}

const queueName = 'backup_queue';

export async function sendBackupMessage( backupData:Messagebackup ){
    await connectRabbitMQ()

    try{

        const channel = await  createChannel()

        await channel.assertQueue( queueName, { durable: true });
        
        channel.sendToQueue(
                 queueName, Buffer.from(JSON.stringify(backupData)),
                 {
                    persistent: true 
                 }
            )

            console.log("Mensagem de backup enviada para a fila "  );
    }catch( error ){
        console.error("Erro ao enviar mensagem para o RabbitMq: ", error);
    }
}


  

*/
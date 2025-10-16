import amqp from 'amqplib'


let rabbitMqUrl = 'amqp://localhost'

if( process.env.RABBITMQ_URL){
    rabbitMqUrl =  process.env.RABBITMQ_URL
}

const queueName = 'backup_queue';

async function sendBackupMessage( backupData:any ){
    try{

        const connection  = await amqp.connect( rabbitMqUrl);   
        const channel = await connection.createChannel()

        await channel.assertQueue( queueName, { durable: true });
        
        channel.sendToQueue(
                 queueName, Buffer.from(JSON.stringify(backupData)),
                 {
                    persistent: true 
                 }
            )

            console.log("Mensagem de backup enviada para a fila:", backupData );

            setTimeout(()=>{ 
                connection.close();
            },500 )

    }catch( error ){
        console.error("Erro ao enviar mensagem para o RabbitMq: ", error);
    }
}


sendBackupMessage({codigo:2, banco:'meridional'})



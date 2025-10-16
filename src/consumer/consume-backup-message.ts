import amqp from 'amqplib';

let rabbitMqUrl = 'amqp://localhost';

const queueName  = 'backup_queue';
if(process.env.RABBITMQ_URL){
    rabbitMqUrl = process.env.RABBITMQ_URL
}

async function consumeBackupMessages(){
    try{

        const connection = await amqp.connect( rabbitMqUrl );

        const channel = await connection.createChannel();

        await channel.assertQueue( queueName, {
            durable:true 
        });

        console.log("Aguardando mensagens de backup a fila...");

        channel.consume( queueName, async ( msg )=>{
            if(msg){
                const receivedData = JSON.parse(msg.content.toString());
                console.log('[X] mensagem recebida: ', receivedData);
            }
        },{
            noAck: false
        }
    
    )
    }catch(error ){

    }
}

 consumeBackupMessages()
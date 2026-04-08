import amqp from 'amqplib';
import { execBackup } from '../services/exe-backup.ts';  // Verifique o caminho correto

let rabbitMqUrl = 'amqp://localhost';
const queueName = 'backup_queue';

if (process.env.RABBITMQ_URL) {
    rabbitMqUrl = process.env.RABBITMQ_URL;
}

function sleep(ms: number) {
  return new Promise(resolve => {
    console.log(`[Worker ${process.pid}] Aguarde ${ms}ms...`); // Adicionado PID para identificar o worker
    setTimeout(resolve, ms);
  });
}

export async function consumeBackupMessages() {
    try {
        const connection = await amqp.connect(rabbitMqUrl);
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName, {
            durable: true
        });

        await channel.prefetch(1);

        console.log(`[Worker ${process.pid}] Aguardando mensagens de backup na fila '${queueName}'...`); // Adicionado PID

        channel.consume(queueName, async (msg) => {
            if (msg) {
                
                 
                const receivedData = JSON.parse(msg.content.toString());

                const { codigo, config, databases, pathZip, databaseName } = receivedData;
                console.log(`[Worker ${process.pid}] Mensagem recebida, executando dump [${databaseName}]` ); // Adicionado PID

                if(!codigo){
                           console.error(`[Worker ${process.pid}] Nao informado o codigo do cliente!` );
                            channel.reject(msg, false);
                            return;
                      }
                     if(!config){
                           console.error(`[Worker ${process.pid}] Nao informado a configuracao de acesso ao banco de dados do cliente!` );
                            channel.reject(msg, false);
                            return;
                     }
                      if(!databases){
                           console.error(`[Worker ${process.pid}] Nao informado o array com os nomes dos bancos de dados do cliente!` );
                            channel.reject(msg, false);
                            return;
                     }
                    if(!pathZip){
                           console.error(`[Worker ${process.pid}] no informado o caminho onde será salvo o arquivo de backup!` );
                            channel.reject(msg, false);
                            return;
                     }
                     if(!databaseName){
                           console.error(`[Worker ${process.pid}] no informado o nome do banco de dados do cliente!` );
                            channel.reject(msg, false);
                            return;
                     }
                     
                try {
                    channel.ack(msg);  
                    

                    await execBackup(Number(codigo), config, databases, String(databaseName), pathZip);
                    console.log(`[Worker ${process.pid}] Backup concluído para:`, databaseName);
                } catch (error) {
                    console.error(`[Worker ${process.pid}] Erro ao executar backup para ${databaseName}:`, error);
                    channel.reject(msg, false); // false = não requeue imediatamente, pode ser configurado para DLX
                }

            }
        }, {
            noAck: false
        });

        // Lidar com desconexões do RabbitMQ
        connection.on('error', (err) => {
            console.error(`[Worker ${process.pid}] Erro na conexão com RabbitMQ:`, err);
            // Reconnectar ou sair para o PM2 reiniciar
            setTimeout(() => {
                console.log(`[Worker ${process.pid}] Tentando reconectar ao RabbitMQ...`);
                consumeBackupMessages();
            }, 5000);
        });

        connection.on('close', () => {
            console.warn(`[Worker ${process.pid}] Conexão com RabbitMQ fechada. Tentando reconectar...`);
            setTimeout(() => {
                consumeBackupMessages();
            }, 5000);
        });

    } catch (error) {
        console.error(`[Worker ${process.pid}] Erro ao iniciar o consumidor de backup:`, error);
        setTimeout(() => {
            console.log(`[Worker ${process.pid}] Tentando reiniciar o consumidor...`);
            consumeBackupMessages();
        }, 5000);
    }
}


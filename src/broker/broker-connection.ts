import amqplib, { type ChannelModel, type Channel  } from 'amqplib';
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

     let connection: ChannelModel | null = null;
      let channel: Channel | null;

const BROKER_URL = process.env.RABBITMQ_URL;
const queueName = 'backup_queue';
 
export async function connectRabbitMQ() {
    if (!BROKER_URL) throw new Error("BROKER_URL não definido.");
    
    if(connection && channel ){
        return  ;
    }

    try {
        console.log("🔌 [RabbitMQ] Iniciando conexão...");
        
        connection = await amqplib.connect(BROKER_URL);
        channel = await connection.createChannel();

        console.log("✅ [RabbitMQ] Conectado  !");

        connection.on('error', (err) => {
            console.error("❌ [RabbitMQ] Erro na conexão:", err.message);
        });

        connection.on('close', () => {
            console.warn("⚠️ [RabbitMQ] Conexão fechada. Tentando reconectar em 5s...");
            connection = null;
            setTimeout(connectRabbitMQ, 5000);  
        });

    } catch (error) {
        connection = null;
        channel = null;
        console.error("❌ [RabbitMQ] Falha ao conectar");
        throw error;
    }
}
 
 
 export async function sendBackupMessage( backupData:Messagebackup ){
      if (!channel || !connection) {
                console.warn("⚠️ [RabbitMQ] Sem conexão ativa. Mensagem não enviada.");
                return false;
            }
     try{
 
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
 
 
import { connectRabbitMQ, sendBackupMessage } from "../broker/broker-connection.ts";
 
 await connectRabbitMQ() 
 await sendBackupMessage({
    codigo:1,
    config:{
        host:'localhost',
        porta: '3306',
        senha: "123",
        usuario:"intersig",
    },
    databaseName:"lps",
    databases:['lps_cep'],
    pathZip:'C:/backup-api'
 })
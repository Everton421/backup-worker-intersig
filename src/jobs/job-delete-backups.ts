
import cron from 'node-cron';
import { deleteOldBackups } from '../services/delete-old-backups.ts';
/**
 * tarefa responsavel por deletar arquivos zip dos backups antigos
 */
export async function deleteZipFilesJob(){

    const expressaoCron = process.env.CRON_DELETE_ARQUIVOS || ' 0 0 * * *';
    cron.schedule( expressaoCron , async () => {
       await deleteOldBackups()
    })
}


await deleteZipFilesJob()
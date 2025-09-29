 

import fs from 'fs/promises'; // Importe a versão de promessa de fs
import path,{ dirname} from 'node:path'
import { fileURLToPath } from 'url';

type resultDeleteFiles = {
    erro: boolean,
    msg: string
}

export async function limparArquivosSql(dbName: string, id: string): Promise<resultDeleteFiles | void> {
    
       const __dirname = dirname(fileURLToPath(import.meta.url))
    
    const tempPath = path.resolve(__dirname, '../../temp');
    const fileNameToDelete = `${dbName}-${id}.sql`;

    try {
        const files = await fs.readdir(tempPath);

        for (const file of files) {
            if (file === fileNameToDelete) {
                const filePath = path.join(tempPath, file);
                try {
                    await fs.unlink(filePath);
                    console.log(`Arquivo ${file} excluído com sucesso.`);
                    return { erro: false, msg: `Arquivo ${file} excluído com sucesso.` }; // Retorna após excluir o arquivo
                } catch (unlinkErr) {
                    console.error(`Erro ao excluir o arquivo ${file}:`, unlinkErr);
                    return { erro: true, msg: `Erro ao excluir o arquivo ${file}: ${unlinkErr}` }; // Retorna se houver um erro na exclusão
                }
            }
        }

        // Se chegou aqui, o arquivo não foi encontrado.
        console.log(`Arquivo ${fileNameToDelete} não encontrado.`);
        return { erro: true, msg: `Arquivo ${fileNameToDelete} não encontrado.` };
    } catch (err) {
        console.error('Erro ao ler o diretório temp:', err);
        return { erro: true, msg: `Erro ao ler o diretório temp: ${err}` };
    }
}
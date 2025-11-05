import fs from 'fs';
import { spawn } from 'child_process';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

type mysqlConfig = {
    host: string;
    porta: string;
    usuario: string;
    senha: string;
};

type resultDumpDatabase = {
    ok: boolean;
    msg: string;
};

export function dumpDatabase(mysqlConfig: mysqlConfig, dbName: string, id: string): Promise<resultDumpDatabase> {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pathTemp = path.resolve(__dirname, `../../temp/${dbName}-${id}.sql`);
    const pathMysqlDump = path.resolve(__dirname, '../../mysqldump.exe');

    return new Promise((resolve, reject) => {
        const mysqldump = spawn(pathMysqlDump, [
            `--host=${mysqlConfig.host}`,
            `--user=${mysqlConfig.usuario}`,
            `--password=${mysqlConfig.senha}`,
            `--port=${mysqlConfig.porta}`,
            '--column-statistics=0',
            `--databases`,
            dbName,
        ]);

        const fileStream = fs.createWriteStream(pathTemp);

        // Trata erros no fileStream
        fileStream.on('error', (err) => {
            console.error(`Erro ao escrever no arquivo ${pathTemp}:`, err);
            reject({ ok: false, msg: `Erro ao escrever no arquivo ${pathTemp}: ${err}` });
            // Garante que o processo mysqldump seja finalizado
            mysqldump.kill();
        });

        // Aguarda o evento 'finish' do fileStream para resolver a Promise
        fileStream.on('finish', () => {
            console.log(`Backup de ${dbName} concluído com sucesso.`);
            resolve({ ok: true, msg: `Backup de ${dbName} concluído com sucesso.` });
        });

        mysqldump.stdout.pipe(fileStream);

        mysqldump.on('close', (code) => {
            if (code === 0) {
                console.log(`mysqldump process exited with code ${code}.`);
                // A resolução e rejeição da promise já são tratadas nos eventos do fileStream
            } else {
                const error = new Error(`mysqldump process exited with code ${code}`);
                console.error(`Erro no processo mysqldump para ${dbName}:`, error);
                reject({ ok: false, msg: `Erro ao tentar efetuar o backup ${error}` });

                // Garante que o fileStream seja fechado
                fileStream.close();
            }
        });

        mysqldump.on('error', (err) => {
            console.error('Falha ao iniciar o processo mysqldump.', err);
            reject({ ok: false, msg: `Falha ao iniciar o processo mysqldump ${err}` });

            // Garante que o fileStream seja fechado
            fileStream.close();
        });
    });
}
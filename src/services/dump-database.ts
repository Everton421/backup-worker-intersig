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

function getMySqlDumpPath(): string {
    if (process.env.MYSQLDUMP_PATH) {
        return process.env.MYSQLDUMP_PATH;
    }
    const __dirname = dirname(fileURLToPath(import.meta.url));
    return path.resolve(__dirname, '../../mysqldump.exe');
}

function cleanupFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

export function dumpDatabase(mysqlConfig: mysqlConfig, dbName: string, id: string): Promise<resultDumpDatabase> {
    if (!dbName || dbName.trim() === '') {
        return Promise.resolve({ ok: false, msg: 'Nome do banco de dados inválido' });
    }

    if (!id || id.trim() === '') {
        return Promise.resolve({ ok: false, msg: 'ID inválido' });
    }

    if (!mysqlConfig?.host || !mysqlConfig?.usuario) {
        return Promise.resolve({ ok: false, msg: 'Configuração do banco de dados incompleta' });
    }

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pathTemp = path.resolve(__dirname, `../../temp/${dbName}-${id}.sql`);
    const pathMysqlDump = getMySqlDumpPath();

    if (!fs.existsSync(pathMysqlDump)) {
        return Promise.resolve({ ok: false, msg: `mysqldump.exe não encontrado em: ${pathMysqlDump}` });
    }

    const tempDir = path.resolve(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const mysqldump = spawn(pathMysqlDump, [
            `--host=${mysqlConfig.host}`,
            `--user=${mysqlConfig.usuario}`,
            `--password=${mysqlConfig.senha}`,
            `--port=${mysqlConfig.porta}`,
            '--column-statistics=0',
            '--databases',
            dbName,
        ]);

        let resolved = false;

        const safeResolve = (result: resultDumpDatabase) => {
            if (!resolved) {
                resolved = true;
                resolve(result);
            }
        };

        const safeReject = (result: resultDumpDatabase) => {
            if (!resolved) {
                resolved = true;
                cleanupFile(pathTemp);
                reject(result);
            }
        };

        const fileStream = fs.createWriteStream(pathTemp);

        fileStream.on('error', (err) => {
            console.error(`Erro ao escrever no arquivo ${pathTemp}:`, err);
            safeReject({ ok: false, msg: `Erro ao escrever no arquivo: ${err.message}` });
            mysqldump.kill();
        });

        mysqldump.stdout.pipe(fileStream);

        mysqldump.on('close', (code) => {
            if (code === 0) {
                fileStream.end(() => {
                    if (!resolved) {
                        console.log(`Backup de ${dbName} concluído com sucesso.`);
                        safeResolve({ ok: true, msg: `Backup de ${dbName} concluído com sucesso.` });
                    }
                });
            } else {
                console.error(`mysqldump encerrou com código ${code} para ${dbName}`);
                safeReject({ ok: false, msg: `mysqldump encerrou com código ${code}` });
                fileStream.close();
            }
        });

        mysqldump.on('error', (err) => {
            console.error('Falha ao iniciar o processo mysqldump:', err);
            safeReject({ ok: false, msg: `Falha ao iniciar mysqldump: ${err.message}` });
            fileStream.close();
        });
    });
}

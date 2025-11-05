import { createClientPoolConnection } from "../database/mysql-create-pool.ts";
import { verifyFile } from "../utils/check-file-in-use.ts";
 import path, { dirname } from "node:path";
  import { fileURLToPath } from "node:url";
import fs from 'node:fs'
import { delay } from "../utils/delay.ts";

const __dirname = dirname(fileURLToPath(import.meta.url))
  const tmpDir = path.join( __dirname,'../../temp','teste.txt')

 let aux = await verifyFile(tmpDir)

 console.log(aux)
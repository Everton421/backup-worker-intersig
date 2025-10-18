import { consumeBackupMessages } from "../utils/consume-backup-message.ts";

consumeBackupMessages().catch(console.error);
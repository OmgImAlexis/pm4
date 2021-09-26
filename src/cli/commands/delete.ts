import { sendCommand } from '../ipc-client';
import { Command } from "../../common/types";
import { logger } from '../common';

export const deleteCommand: Command = {
    name: 'delete',
    async method([appNameOrId, ...args], flags) {
        // Send "delete" command to god
        const result = await sendCommand('delete', [appNameOrId, ...args], flags) as any;

        // Return JSON
        if (flags.json) {
            logger.info(JSON.stringify(result, null, 2));
            return;
        }

        // Return deleted comment
        logger.info(result);
    }
};
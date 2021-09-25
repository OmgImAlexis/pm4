import { sendCommand } from '../ipc-client';
import { Command } from "../../common/types";
import { createCliTable, logger } from '../common';

export const statusCommand: Command = {
    name: 'status',
    async method([appNameOrId, ...args], flags) {
        // Send "status" command to god
        const result = await sendCommand('status', [appNameOrId, ...args], flags) as any[];

        // Return JSON
        if (flags.json) {
            logger.print(JSON.stringify(result, null, 2));
            return;
        }

        // Return table
        logger.print(createCliTable(result));
    }
};
import { sendCommand } from '../ipc-client';
import { Command } from "../../common/types";
import { createCliTable, logger } from '../common';

export const stopCommand: Command = {
    name: 'stop',
    async method([appNameOrId, ...args], flags) {
        // Send "stop" command to god
        const result = await sendCommand('stop', [appNameOrId, ...args], flags) as any;

        // Return JSON
        if (flags.json) {
            logger.print(JSON.stringify(result, null, 2));
            return;
        }

        // Return table
        logger.print(createCliTable([result]));
    }
};
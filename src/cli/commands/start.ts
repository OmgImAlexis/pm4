import { sendCommand } from '../ipc-client';
import { Command } from "../../common/types";
import { createCliTable, logger } from '../common';

export const startCommand: Command = {
    name: 'start',
    description: 'Start an app',
    async method([appNameOrPath, ...args], flags) {
        // Send "start" command to god
        const result = await sendCommand('start', [appNameOrPath, ...args], flags) as any;

        // Return JSON
        if (flags.json) {
            logger.print(JSON.stringify(result, null, 2));
            return;
        }

        // Return table
        logger.print(createCliTable([result]));
    }
};
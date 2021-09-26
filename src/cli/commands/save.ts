import { sendCommand } from '../ipc-client';
import { Command } from "../../common/types";
import { logger } from '../common';

export const saveCommand: Command = {
    name: 'save',
    description: 'Save apps list to allow resume on god restart',
    async method(args, flags) {
        // Send "save" command to god
        const result = await sendCommand('save', args, flags) as any;

        // Return result
        logger.info(result);
    }
};
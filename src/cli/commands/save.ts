import { sendCommand } from '../ipc-client';
import { CliCommand } from "../../common/types";
import { logger } from '../common';
import { z } from 'zod';

export const saveCommand: CliCommand = {
    name: 'save',
    description: 'Save apps list to allow resume on god restart',
    async method(args, flags) {
        // Send "save" command to god
        const result = await sendCommand('save', args, flags).then(data => z.string().safeParseAsync(data));

        // Validate result
        if (!result.success) throw new Error(`Invalid response from god process, expected array but received ${typeof result}.`);

        // Return result
        logger.info(result.data);
    }
};
import { sendCommand } from '../ipc-client';
import { CliCommand } from "../../common/types";
import { logger } from '../common';
import { z } from 'zod';

export const deleteCommand: CliCommand = {
    name: 'delete',
    description: 'Delete an app',
    async method([appNameOrId, ...args], flags) {
        // Send "delete" command to god
        const result = await sendCommand('delete', [appNameOrId, ...args], flags)
            // Ensure god returned a string
            .then(data => z.string().safeParseAsync(data));

        // Validate result
        if (!result.success) throw new Error('Invalid response from god process.');

        // Return JSON
        if (flags.json) {
            logger.info(JSON.stringify(result.data, null, 2));
            return;
        }

        // Return deleted comment
        logger.info(result.data);
    }
};
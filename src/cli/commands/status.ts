import { sendCommand } from '../ipc-client';
import { CliCommand } from "../../common/types";
import { createCliTable, logger } from '../common';
import { AppInfo } from '../../god/apps';
import { z } from 'zod';

export const statusCommand: CliCommand = {
    name: 'status',
    description: 'Get the status of an app or all apps',
    async method([appNameOrId, ...args], flags) {
        // Send "status" command to god
        const result = await sendCommand('status', [appNameOrId, ...args], flags)
            // Ensure god returned an array of AppInfo
            .then(data => z.array(AppInfo).safeParseAsync(data));

        // Validate result
        if (!result.success) throw new Error('Invalid response from god process.');

        // Return JSON
        if (flags.json) {
            logger.print(JSON.stringify(result.data, null, 2));
            return;
        }

        // Return table
        logger.print(createCliTable(result.data));
    }
};
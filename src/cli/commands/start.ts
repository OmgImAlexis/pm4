import { sendCommand } from '../ipc-client';
import { CliCommand } from "../../common/types";
import { createCliTable, logger } from '../common';
import { AppInfo } from '../../god/apps';

export const startCommand: CliCommand = {
    name: 'start',
    description: 'Start an app',
    async method([appNameOrPath, ...args], flags) {
        // Send "start" command to god
        const result = await sendCommand('start', [appNameOrPath, ...args], flags)
            // Ensure god returned an AppInfo
            .then(data => AppInfo.safeParseAsync(data));

        // Validate result
        if (!result.success) throw new Error('Invalid response from god process.');

        // Return JSON
        if (flags.json) {
            logger.print(JSON.stringify(result.data, null, 2));
            return;
        }

        // Return table
        logger.print(createCliTable([result.data]));
    }
};
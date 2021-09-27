import { sendCommand } from '../ipc-client';
import { CliCommand } from "../../common/types";
import { createCliTable, logger } from '../common';
import { AppInfo } from '../../god/apps';

export const stopCommand: CliCommand = {
    name: 'stop',
    description: 'Stop an app',
    async method([appNameOrId, ...args], flags) {
        // Send "stop" command to god
        const result = await sendCommand('stop', [appNameOrId, ...args], flags)
            // Ensure god returned an AppInfo
            .then(data => AppInfo.safeParseAsync(data));


        // Validate result
        if (!result.success) throw new Error('Invalid response from god process.');

        // Return JSON
        if (flags.json) {
            logger.print(JSON.stringify(result, null, 2));
            return;
        }

        // Return table
        logger.print(createCliTable([result]));
    }
};
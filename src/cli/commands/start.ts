import { sendCommand } from '../ipc-client';
import { Command } from "../../common/types";
import { createCliTable } from '../common';

export const startCommand: Command = {
    name: 'start',
    async method([appNameOrId, ...args], flags) {
        // Send "start" command to god
        const result = await sendCommand('start', [appNameOrId, ...args], flags) as any;

        // Return JSON
        if (flags.json) {
            console.log(JSON.stringify(result, null, 2));
            return;
        }

        // Return table
        console.log(createCliTable([result]));
    }
};
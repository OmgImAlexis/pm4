import { sendCommand } from '../ipc-client';
import { Command } from "../../common/types";
import { createCliTable } from '../common';

export const statusCommand: Command = {
    name: 'status',
    async method([appNameOrId, ...args], flags) {
        // Send "status" command to god
        const result = await sendCommand('status', [appNameOrId, ...args], flags) as any[];

        // Return JSON
        if (flags.json) {
            console.log(JSON.stringify(result, null, 2));
            return;
        }

        // Return table
        console.log(createCliTable(result));
    }
};
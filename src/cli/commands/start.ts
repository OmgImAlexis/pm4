import Table from 'cli-table';
import { sendCommand } from '../ipc-client';
import { Command } from "../../common/types";

export const startCommand: Command = {
    name: 'start',
    async method([appNameOrId, ...args], flags) {
        // Send "start" command to god
        const start = await sendCommand('start', [appNameOrId, ...args], flags) as any[];

        const table = new Table({
            head: ['id', 'name', 'mode', 'pid', 'uptime', 'restarts', 'status', 'cpu', 'memory', 'user', 'watching'],
            colWidths: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
        });

        const data = status.map(app => [app.id, app.name, app.mode, app.pid, app.uptime, app.restarts, app.status, app.stats.cpu, app.stats.memory, app.user, app.watching]);

        table.push(data[0]);
        console.log(table.toString());
    }
};
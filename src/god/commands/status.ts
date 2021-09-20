import { Command } from "../../common/types";

export const statusCommand: Command = {
    name: 'status',
    method([appNameOrId, ...args], flags) {
        return [{
            id: 0,
            name: appNameOrId,
            version: '0.0.1',
            mode: 'fork',
            pid: process.pid,
            uptime: 1000,
            restarts: 0,
            status: 'online',
            stats: {
                cpu: 6.7,
                memory: 34.5
            },
            user: 'alexis',
            watching: false
        }]
    }
};

import ipc from 'node-ipc';
import { socketPath, store } from '../common/config';
import { ConfigApp } from './apps';
import * as godCommands from './commands';
import { logger, startApp } from './common';

// Convert imports to iterable
const commands = Object.getOwnPropertyNames(godCommands).filter(key => key !== '__esModule').map(key => godCommands[key as keyof typeof godCommands]);

ipc.config.silent = true;

type Data = {
    id: string;
    command: string;
    args: any[];
    flags: Record<string, number | string>;
}

export const startIpcServer = () => {
    logger.debug('Serving IPC @ %s', socketPath);
    ipc.serve(socketPath, () => {
        ipc.server.on('command', async (data, socket) => {
            // We should get the following object
            // data.id = 'pm4', data.command = status, data.args = [], data.flags = {}
            const { command: commandName, args, flags } = data as Data;

            // Ensure command exists
            const command = commands.find(command => command.name === commandName);
            if (!command) {
                ipc.server.emit(socket, 'command:error', `No command found for "${commandName}".`);
                return;        
            }

            try {
                // Run command method
                const result = await Promise.resolve(command.method(args, flags));

                // Reply with command result
                ipc.server.emit(socket, 'command:reply', result);
            } catch (error: unknown) {
                ipc.server.emit(socket, 'command:error', (error as Error).message);
            }
        });
    });

    ipc.server.start();
};

export const startSavedApps = async () => {
    const savedApps = store.get('apps') as ConfigApp[];
    if (!savedApps || savedApps.length === 0) return;
    logger.debug('Starting %s app%s.', savedApps.length, savedApps.length === 1 ? '' : 's');
    await Promise.all(savedApps.map(app => startApp(app)));
}
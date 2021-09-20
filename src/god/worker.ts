import ipc from 'node-ipc';
import { socketPath } from '../common/config';
import * as godCommands from './commands';

// Convert imports to iterable
const commands = Object.getOwnPropertyNames(godCommands).map(key => godCommands[key as keyof typeof godCommands]);

export const startIpcServer = () => {
    ipc.serve(socketPath, () => {
        ipc.server.on('command', async (data, socket) => {
            // We should get the following object
            // data.id = 'pm4', data.command = status, data.args = [], data.flags = {}
            const { command: commandName, args, flags } = data as any;

            // Ensure command exists
            const command = commands.find(command => command.name === commandName);
            if (!command) {
                ipc.server.emit(socket, 'command:reply', new Error(`No command found for "${commandName}".`));
                return;        
            }

            // Run command method
            const result = await Promise.resolve(command.method(args, flags));

            // Reply with command result
            ipc.server.emit(socket, 'command:reply', result);
        });
    });

    ipc.server.start();
};

import ipc from 'node-ipc';
import { socketPath } from '../common/config';

const id = `pm4[${process.pid}]`;

ipc.config.id = id;
ipc.config.retry = 1000;
ipc.config.silent = true;

export const sendCommand = (command: string, args?: string[], flags?: Record<string, any>) => new Promise((resolve, reject) => {
    const onConnect = () => {
        ipc.of[id].emit('command', {
            id,
            command,
            args: args ?? [],
            flags: flags ?? {}
        });
    };
    
    const onCommandReply = (data: any) => {
        ipc.disconnect(id);
        resolve(data);
    };

    const onCommandError = (error: any) => {
        ipc.disconnect(id);
        reject(new Error(error));
    };

    ipc.connectTo(id, socketPath, () => {
        ipc.of[id].on('connect', onConnect);
        ipc.of[id].on('command:error', onCommandError);
        ipc.of[id].on('command:reply', onCommandReply);
    });
});

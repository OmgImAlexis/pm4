import ipc from 'node-ipc';
import { socketPath } from '../common/config';
import { logger } from './common';

const id = `pm4[${process.pid}]`;

ipc.config.id = id;
ipc.config.retry = 1000;
ipc.config.silent = true;

export const sendCommand = (command: string, args?: string[], flags?: Record<string, any>) => {
    let timer: NodeJS.Timeout;
    return Promise.race([
        new Promise((resolve, reject) => {
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
                clearTimeout(timer);
                resolve(data);
            };
    
            const onCommandError = (error: any) => {
                ipc.disconnect(id);
                clearTimeout(timer);
                reject(new Error(error));
            };
    
            logger.debug('Connecting to IPC @ %s', socketPath);
            ipc.connectTo(id, socketPath, () => {
                ipc.of[id].on('connect', onConnect);
                ipc.of[id].on('command:error', onCommandError);
                ipc.of[id].on('command:reply', onCommandReply);
            });
        }),
        new Promise<void>((_resolve, reject) => {
            timer = setTimeout(() => {
                ipc.disconnect(id);
                reject(new Error(`Timed-out sending command \`${command}\`.`));
            }, 5_000);
        })
    ]);
};

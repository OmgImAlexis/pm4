import { resolve as resolveToAbsolutePath } from 'path';
import minimist from 'minimist';
import AggregateError from 'aggregate-error';
import { serializeError } from 'serialize-error';
import locatePath from 'locate-path';
import { execFile as execChildProcess } from 'child_process';
import { Aliases, CliCommand, CommandMethod, CommandNames, Commands } from '../common/types';
import { logger } from './common';
import psList from 'ps-list';

const commandCache = new Map<Commands | Aliases, CliCommand>();

const loadCommands = (commands: CliCommand[]) => {
    // Load commands
    for (const command of commands) {
        commandCache.set(command.name, command);
        if (command.alias) {
            commandCache.set(command.alias, command);
        }
    }
};

// Run the command or display error
const runCommand = async (commandName: CommandNames, args?: Parameters<CommandMethod>[0], flags?: Parameters<CommandMethod>[1]) => {
    // If the command is missing print message
    if (!commandCache.has(commandName)) {
        logger.error('Unknown command "%s".', commandName);
        return;
    }

    // Run the command
    const command = commandCache.get(commandName);
    try {
        await Promise.resolve(command?.method(args ?? [], flags ?? {}));
    } catch (error: unknown) {
        const argString = args && args.length > 0 ? ' ' + args.join(' ') : '';
        const flagString = flags && Object.values(flags).length > 0 ? ' ' + Object.entries(flags).map(([flag, value]) => {
            return flag.length === 1 ? `-${flag} ${value}` : `--${flag}=${value}`;
        }).join(' ') : '';
        if ((error as Error).message) {
            // Return JSON
            if (flags?.json) {
                logger.print(JSON.stringify(serializeError(error), null, 2));
                return;
            }

            // Print error
            logger.error((error as Error).message);
        } else {
            logger.error('Failed running "pm4 %s%s%s" with "UNKNOWN_ERROR', commandName, argString, flagString);
        }
    }
};

const isGodProcessRunning = async (godPath: string) => {
    const list = await psList();
    const god = list.find(process => {
        return process.name.endsWith('pm4-god') || (process.name === 'node' && process.cmd?.endsWith(godPath)); 
    });
    return god !== undefined;
};

const getGodPath = async () => {
    return resolveToAbsolutePath(process.env.PM4_GOD_BINARY_LOCATION ?? await locatePath([
        // Global
        'pm4-god',
        // Local
        './pm4-god',
        './bin/pm4-god'
    ]) ?? '').split(' ')[0]; // The split ensures only a single path is run without any args
};

const ensureGodExists = async () => {
    const pm4GodPath = await getGodPath();
    const godProcessIsRunning = await isGodProcessRunning(pm4GodPath);
    if (!godProcessIsRunning) {
        // Check if we could find a pm4-god binary
        if (!pm4GodPath) {
            throw new Error('pm4-god binary couldn\'t be located.');
        }

        return new Promise<void>((resolve, reject) => {
            logger.debug('Spawning god process %s', pm4GodPath);
            execChildProcess(pm4GodPath, error => {
                if (error) {
                    if ((error as any).code === 127) {
                        reject(new AggregateError(['pm4-god binary couldn\'t be located.', error]));
                        return;
                    }

                    reject(error);
                    return;
                }
    
                resolve();
            });
        });
    }
};

export const cli = async (argv: string[], commands: CliCommand[]) => {
    // Process cli arguments
    const { _, ...flags } = minimist(argv);
    const [commandName, ...args] = _;

    // Check if god process exists
    // If it doesn't then start it
    await ensureGodExists();

    // Load commands
    loadCommands(commands);

    // Show help if no command is passed
    if (!commandName) {
        await runCommand('help');
        return;
    }

    // Process the command
    await runCommand(commandName as Commands, args, flags);
};

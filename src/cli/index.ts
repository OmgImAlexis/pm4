import minimist from 'minimist';
import processExists from 'process-exists';
import AggregateError from 'aggregate-error';
import { exec as execChildProcess } from 'child_process';
import { Aliases, Command, CommandMethod, CommandNames, Commands } from '../common/types';
import { logger } from './common';

const commandCache = new Map<Commands | Aliases, Command>();

const loadCommands = (commands: Command[]) => {
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
            logger.error((error as Error).message);
        } else {
            logger.error('Failed running "pm4 %s%s%s" with "UNKNOWN_ERROR', commandName, argString, flagString);
        }
    }
};

const ensureGodExists = async () => {
    const godProcessIsRunning = await processExists('pm4-god');
    if (!godProcessIsRunning) {
        return new Promise<void>((resolve, reject) => {
            logger.debug('Spawning god process.');
            execChildProcess(process.env.PM4_GOD_BINARY_LOCATION ?? 'pm4-god', (error => {
                if (error) {
                    if ((error as any).code === 127) {
                        reject(new AggregateError(['pm4-god binary couldn\'t be located.', error]));
                        return;
                    }

                    reject(error);
                    return;
                }
    
                resolve();
            }));
        });
    }
};

export const cli = async (argv: string[], commands: Command[]) => {
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

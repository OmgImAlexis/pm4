import commandLineUsage from 'command-line-usage';
import { CliCommand } from "../../common/types";
import { description } from '../../../package.json';
import { logger } from '../common';
import * as cliCommands from './index';

export const helpCommand: CliCommand = {
    name: 'help',
    alias: 'h',
    description: 'Display help information.',
    method() {
        // Convert imports to iterable
        const commands = Object.getOwnPropertyNames(cliCommands).filter(key => key !== '__esModule').map(key => {
            const command = cliCommands[key as keyof typeof cliCommands];
            return {
                name: command.name,
                summary: command.description
            };
        });

        const sections = [{
            header: 'PM4',
            content: description
        }, {
            header: 'Usage',
            content: '$ pm4 <command> [options]'
        }, {
            header: 'Command List',
            content: commands
        }];

        const usage = commandLineUsage(sections);
        logger.print(usage);
    }
};
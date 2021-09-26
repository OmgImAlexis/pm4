import commandLineUsage from 'command-line-usage';
import { Command } from "../../common/types";
import { description } from '../../../package.json';
import { logger } from '../common';

const sections = [{
    header: 'PM4',
    content: description
}, {
    header: 'Usage',
    content: '$ pm4 <command> [options]'
}, {
    header: 'Command List',
    content: [
        { name: 'help', summary: 'Display help information.' },
        { name: 'start', summary: 'Start an app.' },
        { name: 'stop', summary: 'Stop an app.' },
        { name: 'status', summary: 'Return the status of an app.' },
    ]
}];

const usage = commandLineUsage(sections);

export const helpCommand: Command = {
    name: 'help',
    alias: 'h',
    method() {
        logger.print(usage);
    }
};
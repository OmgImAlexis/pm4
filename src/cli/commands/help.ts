import { Command } from "../../common/types";

export const helpCommand: Command = {
    name: 'help',
    alias: 'h',
    method() {
        console.info('This is the help!');
    }
};
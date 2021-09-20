export type Commands = 'help' | 'status' | 'start' | 'stop';

export type Aliases = 'h';

export type CommandNames = Commands | Aliases;

export type Flag = {
    name: string;
    alias?: string;
    optional: boolean;
};

export type CommandMethod = (args: string[], flags: {
    [arg: string]: any;
    '--'?: string[] | undefined;
}) => void;

export type Command = {
    name: Commands;
    method: CommandMethod;
    alias?: Aliases;
    flags?: Flag[];
};
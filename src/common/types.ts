export type Commands = 'help' | 'status' | 'start' | 'stop' | 'delete';

export type Aliases = 'h';

export type CommandNames = Commands | Aliases;

export type Flag = {
    name: string;
    alias?: string;
    optional: boolean;
};

export type MethodFlags = {
    [arg: string]: any;
    '--'?: string[] | undefined;
};

export type CommandMethod = (args: string[], flags: MethodFlags) => void;

export type Command = {
    name: Commands;
    method: CommandMethod;
    alias?: Aliases;
    flags?: Flag[];
};
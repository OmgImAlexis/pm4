export type Commands = 'help' | 'status' | 'start' | 'stop' | 'restart' | 'delete' | 'save';

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

export type CliCommand = {
    name: Commands;
    description: string;
    method: CommandMethod;
    alias?: Aliases;
    flags?: Flag[];
};

export type GodCommand = {
    name: Commands;
    method: CommandMethod;
    alias?: Aliases;
    flags?: Flag[];
};
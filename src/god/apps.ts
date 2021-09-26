import type { ChildProcess } from 'child_process';

export interface ConfigApp {
    name?: string;
    mode?: 'FORK' | 'CLUSTER';
    script?: string;
    version?: string;
    cwd?: string;
    instances?: number;
}

export interface Config {
    apps?: ConfigApp[]
}

type Status = 'STARTING' | 'RUNNING' | 'STOPPED' | 'CRASHED';

export interface App extends ConfigApp {
    name: string;
    mode: 'FORK' | 'CLUSTER';
    script: string;
    status: Status;
    process?: ChildProcess;
    restarts: number;
}

// Apps known to pm4
export const apps = new Map<string, App>();

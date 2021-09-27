import { ChildProcess } from 'child_process';
import { z } from 'zod';

export const ConfigApp = z.object({
    script: z.string(),
    name: z.optional(z.string()),
    mode: z.optional(z.enum(['FORK', 'CLUSTER'])),
    version: z.optional(z.string()),
    cwd: z.optional(z.string()),
    instances: z.optional(z.number())
});
export type ConfigApp = z.infer<typeof ConfigApp>;

export const Config = z.object({
    apps: z.array(ConfigApp)
});
export type Config = z.infer<typeof Config>;

export const Status = z.enum(['STARTING', 'RUNNING', 'STOPPED', 'CRASHED']);
export type Status = z.infer<typeof Status>;

export const App = ConfigApp.extend({
    name: z.string(),
    mode: z.enum(['FORK', 'CLUSTER']),
    script: z.string(),
    status: Status,
    process: z.instanceof(ChildProcess),
    restarts: z.number(),
});
export type App = z.infer<typeof App>;

export const AppInfo = App.extend({
    mode: z.enum(['FORK', 'CLUSTER']),
    pid: z.number(),
    ports: z.array(z.number()),
    uptime: z.number(),
    stats: z.object({
        cpu: z.number(),
        memory: z.number()
    }),
    user: z.string(),
    watching: z.boolean()
});

export type AppInfo = z.infer<typeof AppInfo>;

// Apps known to pm4
export const apps = new Map<string, App>();

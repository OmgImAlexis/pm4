import { readFileSync } from 'fs';
import { fork as forkProcess, ChildProcess } from 'child_process';
import { Command } from "../../common/types";
import { App, apps, Config, ConfigApp } from '../apps';
import { getAppStatus } from '../common';

const startApp = async (app: ConfigApp) => {
    if (!app.name) throw new Error(`App has no \`name\` field.`);
    if (!app.script) throw new Error(`App ${app.name} has no \`script\` field.`);

    // Get app's name and script path
    const appName = app.name;
    const scriptPath = app.script;

    // Save the child process outside of the race
    // This is to allow us to kill it if the timeout is quicker
    let childProcess: ChildProcess;

    // Either the new process will spawn
    // or it'll timeout/disconnect/exit
    await Promise.race([
        new Promise<void>((resolve, reject) => {
            // Fork the child process
            childProcess = forkProcess(scriptPath, {
                silent: true
            });
            
            // Save a reference to this child process for later
            const app = {
                name: appName,
                script: scriptPath,
                status: 'STARTING' as const,
                process: childProcess,
                restarts: 0
            };
            apps.set(appName, app);
            
            childProcess.stderr?.on('data', data => {
                reject(new Error(data));
            });
    
            childProcess.on('exit', code => {
                const app = apps.get(appName);
                // If this was the running app then update the apps store
                if (app?.status === 'RUNNING' && app.process?.pid === childProcess.pid) {
                    apps.set(appName, {
                        ...app,
                        process: undefined,
                        status: code === 0 ? 'STOPPED' : 'CRASHED'
                    });
                }
            })
             
            childProcess.on('message', (message: string) => {
                if (message === 'ready') {
                    apps.set(appName, {
                        ...app,
                        status: 'RUNNING'
                    });
                    resolve();
                }
            });
        }),
        new Promise<void>((_resolve, reject) => {
            setTimeout(() => {
                reject(new Error(`Timed-out starting \`${app.name}\`.`));
            }, 30_000);
        })
    ]).catch(() => {
        childProcess.kill();
    });
}

export const startCommand: Command = {
    name: 'start',
    async method([appName, ..._args], flags) {
        // The user provided config
        const config = flags.config ? JSON.parse(readFileSync(flags.config, 'utf8')) as Config : undefined;

        // Get the app
        const app: Partial<App> | undefined = apps.get(appName) ?? config?.apps?.find(app => app.name === appName);
        if (!app) {
            throw new Error(`No app found with name \`${appName}\`.`);
        }

        // If the app isn't stopped/crashed then bail
        if (app.status && !['CRASHED', 'STOPPED'].includes(app.status)) {
            throw new Error(`Cannot start app as it's currently \`${app.status}\`.`);
        }

        // Start the app
        if (app.script) await startApp(app);
        
        // Return current status of the app
        return getAppStatus(appName);
    }
};

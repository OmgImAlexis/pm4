import { fork as forkProcess, ChildProcess } from 'child_process';
import { App, apps, ConfigApp } from '../apps';
import { logger } from '../common';

export const startApp = async (config: ConfigApp, restarts = 0) => {
    if (!config.name) throw new Error(`App has no \`name\` field.`);
    if (!config.script) throw new Error(`App ${config.name} has no \`script\` field.`);

    // Get app's name and script path
    const appName = config.name;
    const scriptPath = config.script;
    const mode = config.mode ?? 'fork';
    const instances = config.instances ?? 1;

    // Save the child process outside of the race
    // This is to allow us to kill it if the timeout is quicker
    let childProcess: ChildProcess;

    logger.debug('Starting %s in %s mode with %s instance%s.', appName, mode, instances, instances === 1 ? '' : 's');

    // Either the new process will spawn
    // or it'll timeout/disconnect/exit
    await Promise.race([
        new Promise<void>((resolve, reject) => {
            // Fork the child process
            childProcess = forkProcess(scriptPath, {
                silent: true
            });
            
            // The initial app
            const app: App = {
                name: appName,
                mode,
                script: scriptPath,
                status: 'STARTING' as const,
                process: childProcess,
                restarts
            };

            // Save a reference to this child process for later
            apps.set(appName, app);
            
            childProcess.stderr?.on('data', data => {
                reject(new Error(data));
            });
    
            childProcess.on('exit', code => {
                const app = apps.get(appName);
                if (!app) return;

                // If this app was running then update the apps store
                if (app?.status === 'RUNNING' && app.process?.pid === childProcess.pid) {
                    apps.set(appName, {
                        ...app,
                        process: undefined,
                        status: code === 0 ? 'STOPPED' : 'CRASHED',
                        restarts: code === 0 ? 0 : ((restarts < 5) ? (app.restarts + 1) : app.restarts)
                    });

                    // Restart the app
                    if (code !== 0 && restarts < 5) {
                        logger.info('Restarting %s %s/%s', app.name, restarts + 1, 5);
                        startApp(app, restarts + 1);
                        return;
                    }
                }
            });
             
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
                reject(new Error(`Timed-out starting \`${config.name}\`.`));
            }, 30_000);
        })
    ]).catch(() => {
        childProcess.kill();
    });
};

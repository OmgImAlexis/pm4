import { join as joinPath } from 'path';
import { createWriteStream, mkdirSync } from 'fs';
import { fork as forkProcess, ChildProcess } from 'child_process';
import { App, apps, ConfigApp } from '../apps';
import { logger } from '../common';
import { logsPath } from '../../common/config';

export const startApp = async (config: ConfigApp, restarts = 0, shouldRestart = true) => {
    if (!config.name) throw new Error(`App has no \`name\` field.`);
    if (!config.script) throw new Error(`App ${config.name} has no \`script\` field.`);
    if (['STARTING', 'RUNNING'].includes(apps.get(config.name)?.status ?? '')) throw new Error(`Cannot start app as it's already \`${apps.get(config.name)?.status}\`.`);

    // Get app's name and script path
    const appName = config.name;
    const scriptPath = config.script;
    const mode = config.mode?.toUpperCase() as App['mode'] ?? 'FORK';
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
                silent: true,
                stdio: 'pipe'
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

            // Ensure the directories exist for the log files
            const logDirectory = joinPath(logsPath, 'apps');
            mkdirSync(logDirectory, { recursive: true });

            // Create stdout and stderr log files
            const logConsoleStream = createWriteStream(joinPath(logDirectory, `${appName}.stdout.log`), { flags: 'a' });
            const logErrorStream = createWriteStream(joinPath(logDirectory, `${appName}.stderr.log`), { flags: 'a' });

            // redirect stdout and stderr to log files
            childProcess.stdout?.pipe(logConsoleStream);
            childProcess.stderr?.pipe(logErrorStream);
            
            childProcess.stderr?.on('data', data => {
                reject(data);
            });
    
            childProcess.on('exit', code => {
                const app = apps.get(appName);
                if (!app) return;

                const exitCode = code ?? 0;
                logger.debug('%s exited with code %s', appName, exitCode);

                // Update the apps store
                const status = exitCode === 0 ? 'STOPPED' : 'CRASHED';
                logger.debug('Setting status of %s to %s', appName, status);
                apps.set(appName, {
                    ...app,
                    process: undefined,
                    status,
                    restarts: exitCode === 0 ? 0 : ((restarts < 5) ? (app.restarts + 1) : app.restarts)
                });

                // Restart the app
                if (shouldRestart && exitCode !== 0 && restarts < 5) {
                    logger.info('Restarting %s %s/%s', app.name, restarts + 1, 5);
                    startApp(app, restarts + 1);
                    return;
                }
            });
             
            childProcess.on('message', (message: string) => {
                if (message === 'ready') {
                    logger.debug('%s is ready', app.name);
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

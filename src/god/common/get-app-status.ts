import pidusage from 'pidusage';
import find from 'find-process';
import execa from 'execa';
import { apps } from "../apps";
import { logger } from './logger';
import { getPortsUsed } from './get-ports-used';

export const getAppStatus = async (appName: string) => {
    let app = apps.get(appName);
    if (!app) {
        throw new Error(`No app found with name \`${appName}\`.`);
    }

    // Get memory, cpu, etc.
    const stats = app.process?.pid ? await pidusage(app.process?.pid).catch(() => undefined) : undefined;
    const info = app.process?.pid ? await find('pid', app.process?.pid).then(processes => processes[0]).catch(error => { logger.debug(error); return undefined; }) : undefined;
    const user = info?.uid ? await execa('id', ['-un', `${info?.uid}`]).then(_ => _.stdout).catch(error => { logger.debug(error); return undefined; }) : undefined;
    const ports = app.process?.pid ? await getPortsUsed(app.process.pid) : [];

    return {
        name: appName,
        version: app.version,
        mode: app.mode,
        pid: app.process?.pid,
        ports,
        uptime: stats?.elapsed,
        restarts: app.restarts,
        status: app.status,
        stats: {
            cpu: stats?.cpu,
            memory: stats?.memory
        },
        user,
        watching: false
    };
};

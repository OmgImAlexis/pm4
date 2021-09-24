import pidusage from 'pidusage';
import find from 'find-process';
import execa from 'execa';
import { apps } from "../apps";

export const getAppStatus = async (appName: string) => {
    const app = apps.get(appName);
    if (!app) {
        throw new Error(`No app found with name \`${appName}\`.`);
    }

    // Get memory, cpu, etc. stats
    const stats = app.process?.pid ? await pidusage(app.process?.pid).catch(error => { console.log(error); return undefined; }) : undefined;
    const info = app.process?.pid ? await find('pid', app.process?.pid).then(processes => processes[0]).catch(error => { console.log(error); return undefined; }) : undefined;
    const user = info?.uid ? await execa('id', ['-un', `${info?.uid}`]).then(_ => _.stdout).catch(error => { console.log(error); return undefined; }) : undefined;

    return {
        name: appName,
        version: app.version,
        mode: 'fork',
        pid: app.process?.pid,
        uptime: stats?.elapsed,
        restarts: 0,
        status: app.status,
        stats: {
            cpu: stats?.cpu,
            memory: stats?.memory
        },
        user,
        watching: false
    };
}

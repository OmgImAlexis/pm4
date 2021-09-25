import netstat from 'node-netstat';
import pidusage from 'pidusage';
import find from 'find-process';
import execa from 'execa';
import { apps } from "../apps";
import { logger } from './logger';

export const getPortsUsed = async (pid?: number): Promise<number[]> => {
    const pids = await new Promise<Map<number, Set<number>>>(resolve => {
        const pids = new Map();
        netstat({
            done() {
                resolve(pids);
            }
        }, (data: any) => {
            if (!pids.has(data.pid)) {
                pids.set(data.pid, new Set());
            }

            pids.get(data.pid).add(data.local.port);
        });
    });

    if (!pid) return Array.from([...pids.values()].map(values => [...values]).flat());
    return Array.from(pids.get(pid)?.values() ?? []);
};

export const getAppStatus = async (appName: string) => {
    const app = apps.get(appName);
    if (!app) {
        throw new Error(`No app found with name \`${appName}\`.`);
    }

    // Get memory, cpu, etc.
    const stats = app.process?.pid ? await pidusage(app.process?.pid).catch(error => { logger.debug(error); return undefined; }) : undefined;
    const info = app.process?.pid ? await find('pid', app.process?.pid).then(processes => processes[0]).catch(error => { logger.debug(error); return undefined; }) : undefined;
    const user = info?.uid ? await execa('id', ['-un', `${info?.uid}`]).then(_ => _.stdout).catch(error => { logger.debug(error); return undefined; }) : undefined;
    const ports = app.process?.pid ? await getPortsUsed(app.process.pid) : [];

    return {
        name: appName,
        version: app.version,
        mode: 'fork',
        pid: app.process?.pid,
        ports,
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

export * from './logger';
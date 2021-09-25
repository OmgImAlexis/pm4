import Table from "cli-table";
import prettyTime from 'interval-to-human';
import prettyBytes from "pretty-bytes";
import { App } from "../../god/apps";

interface AppInfo extends App {
    mode: 'FORK' | 'CLUSTER';
    pid: number;
    ports: number[];
    uptime: number;
    stats?: {
        cpu: number;
        memory: number;
    }
    user: string;
    watching: boolean;
}

export const createCliTable = (result: AppInfo[]) => {
    const table = new Table({
        head: ['name', 'mode', 'pid', 'ports', 'uptime', 'restarts', 'status', 'cpu', 'memory', 'user', 'watching'],
        colWidths: [15, 8, 8, 15, 13, 10, 10, 10, 10, 10, 10]
    });
    const data = result.map(app => [
        app.name,
        app.mode,
        app.pid,
        app.ports,
        app.uptime ? prettyTime(app.uptime) : undefined,
        app.restarts,
        app.status,
        app?.stats?.cpu !== undefined ? `${(app?.stats.cpu / 100).toFixed(2)}%` : undefined,
        app?.stats?.memory ? prettyBytes(app?.stats.memory) : undefined,
        app.user,
        app.watching ? 'yes' : 'no'
    ].map(item => (Array.isArray(item) ? item.length > 0 : item !== undefined) ? item : '-'));
    data.forEach(app => table.push(app));
    return table.toString();
}

export * from './logger';
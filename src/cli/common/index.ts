import Table from "cli-table3";
import { cyan, gray, green, red } from "nanocolors";
import prettyTime from 'interval-to-human';
import prettyBytes from "pretty-bytes";
import { AppInfo } from "../../god/apps";

const statusColours = {
    CRASHED: red,
    STARTING: cyan,
    RUNNING: green,
    STOPPED: gray
};

export const createCliTable = (apps: AppInfo[]) => {
    const table = new Table({
        head: ['name', 'mode', 'pid', 'ports', 'uptime', 'restarts', 'status', 'cpu', 'memory', 'user', 'watching'],
        style: {
            head: ['cyan']
        },
        colWidths: [15, 8, 8, 15, 13, 10, 10, 10, 10, 10, 10]
    });

    apps.forEach(app => {
        table.push([
            app.name,
            app.mode,
            app.pid,
            app.ports,
            app.uptime ? prettyTime(app.uptime) : undefined,
            app.restarts,
            Object.keys(statusColours).includes(app.status) ? statusColours[app.status](app.status) : app.status,
            app?.stats?.cpu !== undefined ? `${(app?.stats.cpu / 100).toFixed(2)}%` : undefined,
            app?.stats?.memory ? prettyBytes(app?.stats.memory) : undefined,
            app.user,
            app.watching ? 'yes' : 'no'
        ].map(item => (Array.isArray(item) ? item.length > 0 : item !== undefined) ? String(item) : '-') as Table.HorizontalTableRow);
    });

    return table.toString();
}

export * from './logger';
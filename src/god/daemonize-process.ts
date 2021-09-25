import psList from 'ps-list';
import { spawn as spawnChildProcess } from 'child_process';
import { logger } from './common';

export const daemonizeProcess = async () => {
    const processes = await psList();
    const godPid = processes
        .filter(_process => _process.pid !== process.pid)
        .find(_process => _process.name === 'pm4-god' || _process.cmd?.split(' ')[0] === 'pm4-god')?.pid;

    // God already exists
    if (godPid) {
        logger.debug(`Already running with pid "${godPid}".`);

        // Exit cleanly
        process.exit(0);
    }

    // Spawn background daemon
    spawnChildProcess(process.execPath, process.argv.slice(2), {
        // In the parent set the tracking environment variable
        env: Object.assign(process.env, { _DAEMONIZE_PROCESS: '1' }),
        stdio: 'ignore',
        detached: true
    }).unref();

    // Exit cleanly
    process.exit(0);
};

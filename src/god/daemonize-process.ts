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

    // If you're using a js bin file this needs to be slice(1)
    // If you're using a nexe bin file this needs to be slice(2)
    const args = process.argv.slice(1);

    // Spawn daemon
    const daemon = spawnChildProcess(process.execPath, args, {
        // In the parent set the tracking environment variable
        env: Object.assign(process.env, { _DAEMONIZE_PROCESS: '1' }),
        stdio: 'ignore',
        detached: true
    });

    // Background the process
    daemon.unref();
    logger.debug(`Daemonized process "${daemon.pid}".`);

    // Exit cleanly
    process.exit(0);
};

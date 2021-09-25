import { startIpcServer, startSavedApps } from './god/worker';
import { daemonizeProcess } from './god/daemonize-process';
import { version } from '../package.json';
import { logger } from './god/common';

logger.debug('Version: %s', version);

// We were invoked directly, let's spawn a background daemon
if (!('_DAEMONIZE_PROCESS' in process.env)) {
    // Spawn the background daemon
    daemonizeProcess();
}

// This is the background daemon
if ('_DAEMONIZE_PROCESS' in process.env) {
    delete process.env._DAEMONIZE_PROCESS;

    // Start saved apps
    startSavedApps();

    // Start ipc server
    startIpcServer();
}

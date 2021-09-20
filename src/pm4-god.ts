import { startIpcServer } from './god/worker';
import { daemonizeProcess } from './god/daemonize-process';

// We were invoked directly, let's spawn a background daemon
if (!('_DAEMONIZE_PROCESS' in process.env)) {
    daemonizeProcess();
}

// This is the background daemon
if ('_DAEMONIZE_PROCESS' in process.env) {
    delete process.env._DAEMONIZE_PROCESS;

    // Start ipc server
   startIpcServer();
}

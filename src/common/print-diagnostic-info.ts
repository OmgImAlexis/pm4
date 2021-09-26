import { version } from '../../package.json';
import { createLogger } from './logger';
import { isDebug } from './config';

export const printDiagnosticInfo = (logger: ReturnType<typeof createLogger>) => {
    if (!isDebug) return;
    logger.print('========================================================');
    logger.debug('PM4 version: %s', version);
    logger.debug('Node version: %s', process.versions.node);
    logger.print('========================================================');
};

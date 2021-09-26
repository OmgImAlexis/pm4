import { version } from '../../package.json';
import { logger } from '../god/common';
import { isDebug } from './config';

export const printDiagnosticInfo = () => {
    if (!isDebug) return;
    logger.print('========================================================');
    logger.debug('PM4 version: %s', version);
    logger.debug('Node version: %s', process.versions.node);
    logger.print('========================================================');
};

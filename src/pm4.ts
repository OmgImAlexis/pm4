import * as cliCommands from './cli/commands';
import { cli } from './cli';
import { logger } from './cli/common';
import { version } from '../package.json';

// Convert imports to iterable
const commands = Object.getOwnPropertyNames(cliCommands).map(key => cliCommands[key as keyof typeof cliCommands]);

// Print user error
// If in debug mode print the whole error
const handleCliError = (error: any) => {
    // Real error
    if (!error.errors) {
        // Show them all the details
        logger.info(error);
        process.exit(1);
    }

    // Aggregate error, this should be a user error
    if (error.errors) {
        // In non-debug just show the nice error
        logger.error(error.errors[0].message);
    
        // In debug mode show all the errors
        for (const individualError of error.errors) {
            logger.debug(individualError);
        }
        
        process.exit(1);
    }

    process.exit(1);
};

logger.debug('Version: %s', version);

// Process cli command
cli(process.argv.slice(2), commands).catch(error => handleCliError(error));
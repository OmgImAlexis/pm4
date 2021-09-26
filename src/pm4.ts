import AggregateError from 'aggregate-error';
import * as cliCommands from './cli/commands';
import { cli } from './cli';
import { logger } from './cli/common';
import { printDiagnosticInfo } from './common/print-diagnostic-info';

// Convert imports to iterable
const commands = Object.getOwnPropertyNames(cliCommands).map(key => cliCommands[key as keyof typeof cliCommands]);

const isAggregateError = (error: unknown): error is AggregateError => error instanceof AggregateError;
const isError = (error: unknown): error is Error => error instanceof Error;

// Print user error
// If in debug mode print the whole error
const handleCliError = (error: unknown) => {
    // Real error
    if (!isAggregateError(error) && isError(error)) {
        // Show them all the details
        logger.error(error);
        process.exit(1);
    }

    // Aggregate error, this should be a user error
    if (isAggregateError(error)) {
        // In non-debug just show the nice error
        logger.error(error.errors[0].message as string);
    
        // In debug mode show all the errors
        for (const individualError of error.errors) {
            logger.debug(isError(individualError) ? individualError.message : individualError as string);
        }
        
        process.exit(1);
    }

    process.exit(1);
};

printDiagnosticInfo(logger);

// Process cli command
cli(process.argv.slice(2), commands).catch((error: unknown) => handleCliError(error));
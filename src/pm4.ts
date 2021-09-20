import * as cliCommands from './cli/commands';
import { cli } from './cli';

// Convert imports to iterable
const commands = Object.getOwnPropertyNames(cliCommands).map(key => cliCommands[key as keyof typeof cliCommands]);

// Print user error
// If in debug mode print the whole error
const handleCliError = (error: any) => {
    // Real error
    if (!error.errors) {
        // Show them all the details
        console.log(error);
        process.exit(1);
    }

    // Aggregate error, this should be a user error
    if (error.errors) {
        // In non-debug just show the nice error
        if (!process.env.DEBUG) {
            console.log(error.errors[0].message);
            process.exit(1);
        }
    
        // In debug mode show all the errors
        for (const individualError of error.errors) {
            console.log(individualError);
        }
        
        process.exit(1);
    }

    process.exit(1);
};

// Process cli command
cli(process.argv.slice(2), commands).catch(error => handleCliError(error));
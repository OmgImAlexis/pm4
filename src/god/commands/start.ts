import { readFileSync, existsSync } from 'fs';
import { GodCommand } from "../../common/types";
import { App, apps, Config } from '../apps';
import { startApp, getAppStatus } from '../common';

const getConfig = (configPath: string) => {
    try {
        return JSON.parse(readFileSync(configPath, 'utf8')) as Config;
    } catch {
        return undefined;
    }
};

export const startCommand: GodCommand = {
    name: 'start',
    async method([appNameOrPath, ..._args], flags) {
        if (!appNameOrPath) {
            throw new Error('No app name or path provided.');
        }

        // Ensure the user config path is a string
        const configPath = typeof flags.config === 'string' ? flags.config : undefined;

        // Check if the user provided config exists
        if (configPath && !existsSync(configPath)) throw new Error(`Config path ${configPath} doesn't exist.`);

        // Get the user's config
        const config = getConfig(configPath ?? './config.json');

        // Get the app
        const app: Partial<App> | undefined = apps.get(appNameOrPath) ?? config?.apps?.find(app => app.name === appNameOrPath);
        if (!app) {
            // Check if maybe this was a path they passed
            if (!existsSync(appNameOrPath)) {
                throw new Error(`No app found with name \`${appNameOrPath}\`.`);
            }

            // We were only given a path so we need to generate the app ourselves
            const appName = appNameOrPath.split('/').pop()?.split('.')[0];
            if (!appName) throw new Error(`Failed generating app name from ${appNameOrPath}`);
            await startApp({
                name: appName,
                script: appNameOrPath              
            });

            // Return current status of the app
            return getAppStatus(appName);
        }

        // If the app isn't stopped/crashed then bail
        if (app.status && !['CRASHED', 'STOPPED'].includes(app.status)) {
            throw new Error(`Cannot start app as it's currently \`${app.status}\`.`);
        }

        // Start the app
        if (app.script) await startApp(app);
        
        // Return current status of the app
        return getAppStatus(appNameOrPath);
    }
};

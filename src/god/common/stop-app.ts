import { App, apps } from "../apps";
import { logger } from "./logger";

export const stopApp = (app: App) => {
    logger.debug('Stopping %s.', app.name);
    
    return new Promise<void>(resolve => {
        app.process?.on('exit', () => {
            resolve();
        });

        app.process?.kill();
        apps.set(app.name, {
            ...app,
            process: undefined,
            status: 'STOPPED'
        });          
    });
}

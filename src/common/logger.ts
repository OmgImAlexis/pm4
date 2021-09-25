import { cyan, green, yellow, red } from 'nanocolors';

const isDebug = process.env.DEBUG !== undefined;

export const createLogger = (namespace: string) => {
    namespace = namespace.toUpperCase();
    return {
        info(message: string, ...args: any[]) {
            console.info(`${cyan(`[${namespace}]`)} ${message}`, ...args);
        },
        debug(message: string, ...args: any[]) {
            if (!isDebug) return;
            console.debug(`${green(`[${namespace}]`)} ${message}`, ...args);
        },
        warning(message: string, ...args: any[]) {
            console.warn(`${yellow(`[${namespace}]`)} ${message}`, ...args);
        },
        error(message: string | Error, ...args: any[]) {
            console.error(`${red(`[${namespace}]`)} ${message}`, ...args);
        },
        print(message: string, ...args: any[]) {
            console.log(message, ...args);
        }
    };
};
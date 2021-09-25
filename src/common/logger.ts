const isDebug = process.env.DEBUG !== undefined;

export const createLogger = (namespace: string) => {
    return {
        info(message: string, ...args: any[]) {
            console.info(`[${namespace}] ${message}`, ...args);
        },
        debug(message: string, ...args: any[]) {
            if (!isDebug) return;
            console.debug(`[${namespace}] ${message}`, ...args);
        },
        warning(message: string, ...args: any[]) {
            console.warn(`[${namespace}] ${message}`, ...args);
        },
        error(message: string | Error, ...args: any[]) {
            console.error(`[${namespace}] ${message}`, ...args);
        },
        print(message: string, ...args: any[]) {
            console.log(message, ...args);
        }
    };
};
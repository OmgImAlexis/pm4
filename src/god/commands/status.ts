import { GodCommand } from "../../common/types";
import { apps } from "../apps";
import { getAppStatus } from "../common/get-app-status";

export const statusCommand: GodCommand = {
    name: 'status',
    async method([appName, ..._args], _flags) {
        // Return status for all apps
        if (!appName) {
            const appNames = [...apps.keys()];
            return Promise.all(appNames.map(async appName => await getAppStatus(appName)));
        }

        // Return status for a single app
        return [await getAppStatus(appName)];
    }
};

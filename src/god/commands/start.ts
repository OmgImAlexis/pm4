import { statusCommand } from "../../cli/commands";
import { Command } from "../../common/types";

// Apps known to pm4
const apps = new Map();

export const startCommand: Command = {
    name: 'start',
    method([appNameOrId, ..._args], flags) {
        if (!apps.has(appNameOrId)) {
            throw new Error(`No app found with name or id "${appNameOrId}".`);
        }
        
        // Return current status of the app
        return statusCommand.method([appNameOrId], flags);
    }
};

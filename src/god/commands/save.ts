import { GodCommand } from "../../common/types";
import { apps } from "../apps";
import { saveApps } from "../common/save-apps";

export const saveCommand: GodCommand = {
    name: 'save',
    async method(_args, _flags) {
        saveApps();
        return `${apps.size} app${apps.size === 1 ? '' : 's'} saved to disk`;
    }
};

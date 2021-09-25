import Conf from 'conf';

export const socketPath = process.env.PM4_SOCKET_PATH ?? '/var/run/pm4.sock';

export const store = new Conf({
    projectSuffix: '',
    schema: {
        apps: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                    mode: {
                        type: 'string',
                    },
                    script: {
                        type: 'string',
                    }
                }
            }
        }
    }    
});

import netstat from 'node-netstat';

export const getPortsUsed = async (pid?: number): Promise<number[]> => {
    const pids = await new Promise<Map<number, Set<number>>>(resolve => {
        const pids = new Map();
        netstat({
            done() {
                resolve(pids);
            }
        }, (data: any) => {
            if (!pids.has(data.pid)) {
                pids.set(data.pid, new Set());
            }

            pids.get(data.pid).add(data.local.port);
        });
    });

    if (!pid) return Array.from([...pids.values()].map(values => [...values]).flat());
    return Array.from(pids.get(pid)?.values() ?? []);
};

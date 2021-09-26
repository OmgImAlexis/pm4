import test from 'ava';
import { apps } from '../src/god/apps';
import { startApp } from '../src/god/common/start-app';
import { stopApp } from '../src/god/common/stop-app';

const sleep = (milliseconds: number) => new Promise<void>(resolve => {
    setTimeout(() => {
        resolve();
    }, milliseconds);
});

test('Can start and stop an app', async t => {
    const appName = 'hello-world';

    // Start the app
    await startApp({
        name: appName,
        script: './examples/hello-world.js'
    }, 0, false);

    // Wait 1s for the app to be ready
    await sleep(1_000);

    // Check the app is started
    t.is(apps.get(appName).status, 'RUNNING');

    // Stop the app
    await stopApp(apps.get(appName));
});

const { test } = require('@playwright/test');

// test('smoke test', async ({ page }) => {
//   await page.goto(`file://${process.cwd()}/bench.html`);
// });

test('Run benchmarks', async ({ page }) => {
	test.setTimeout(120000);
    let benchmarkPromise = new Promise(resolve => {
        page.on('console', async message => {
            if (message.text() === 'Benchmark suite complete.') {
                // if the suite has finished, we're done
                resolve();
            } else {
                // pipe through any other console output
                console[message.type()](message);
            }
        });
    });

    await page.goto(`file://${process.cwd()}/bench.html`);
    await benchmarkPromise;
});

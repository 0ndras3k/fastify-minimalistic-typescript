import fastifyPlugin from 'fastify-plugin';
import fastifyCors from 'fastify-cors';
import fastifyHelmet from 'fastify-helmet';
import { glob } from 'glob';

import path from 'path';
import { App } from '../..';

export default fastifyPlugin(async (app, options) => {
    const dev = App.dev();

    app.register(fastifyCors, {
        credentials: true,
        origin: dev ? 'http://localhost:3000' : 'prod. address',
    });
    app.register(fastifyHelmet);

    //TODO: add error handling

    // Controllers
    const ctrls = glob.sync(
        path.join(__dirname, '..', 'controllers', '*Controller.ts'),
    );
    for (const ctrl of ctrls) {
        const baseName = path.parse(ctrl).base;
        const controller = await import(ctrl);

        if (!controller.default) {
            console.warn(
                dev
                    ? `Controller ${baseName} does not have a default export. Skipping...`
                    : `An internal error has occurred while starting Fastify!`,
            );
            continue;
        }
        if (typeof controller.default !== 'function') {
            console.warn(
                dev
                    ? `Controller ${baseName} does not default export a function. Skipping...`
                    : `An internal error has occurred while starting Fastify!`,
            );
            continue;
        }

        if (dev) console.info(`Controller ${baseName} registered!`);

        controller.hasOwnProperty('routePrefix')
            ? app.register(controller.default, {
                  prefix: `/api/v1${controller.routePrefix}`,
              })
            : app.register(controller.default, { prefix: '/api/v1' });
    }
});
import 'reflect-metadata';
import { fastify, FastifyInstance } from 'fastify';
import InitPlugin from './http/plugins/InitPlugin';

import { fastify as fastifyCfg } from '../config';

export type ControllerFunc = (fastify: FastifyInstance, options: any) => any;

export class App {
    app = fastify();

    constructor() {
        this.init();
    }

    async init() {
        if (process.argv.includes('--dev')) {
            console.log(
                'Enforcing development environment with the --dev flag',
            );
            process.env.NODE_ENV = 'development';
        }
        await this.initFastify();
    }

    async initFastify() {
        this.app.register(InitPlugin);

        try {
            const address = await this.app.listen(
                fastifyCfg.port,
                fastifyCfg.address,
            );
            console.log('Listening on', address);
        } catch (error) {
            console.error('An error has occurred:', error);
        }
    }

    static dev = () => process.env.NODE_ENV === 'development';
}

const app = new App();
export default app;
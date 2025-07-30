import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { AppDataSource } from "./data-source1.js";
import * as dotenv from "dotenv";
import { TTest1 } from './entities/TTest1.js';
import { error } from 'console';
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });
const app = new Hono();
/** DB 연결 */
AppDataSource.initialize()
    .then(() => {
    console.log("Data Source has been initialized!");
})
    .catch((err) => {
    console.error("Error during Data Source initialization:", err);
});
/** DB 연결 END */
app.get('/', (c) => {
    return c.text('Hello Hono!');
});
app.get('/test', async (c) => {
    let result = {
        success: true,
        data: null,
        code: "",
        message: ``,
    };
    try {
        const testRepository = AppDataSource.getRepository(TTest1);
        const data = await testRepository.find();
        result.data = data;
        throw new Error;
        return c.json(result);
    }
    catch (error) {
        result.success = false;
        result.message = `error. ${error?.message ?? ""}`;
        return c.json(result);
    }
});
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});

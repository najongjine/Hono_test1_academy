import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { AppDataSource } from "./data-source1.js";
import * as dotenv from "dotenv";
import { TTest1 } from './entities/TTest1.js';
import { error } from 'console';
import { TTest1Child } from './entities/TTest1Child.js';

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });

const app = new Hono()

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
  return c.text('Hello Hono!')
});

/**
 c 라는 놈 : 요청, 응답을 가지고 있는 객체
 async : 비동기 환경에서, db 접속같이 시간이 걸리는것도
 기다리게 해주는놈
 */
app.get('/test', async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    const testRepository = AppDataSource.getRepository(TTest1);
    const data = await testRepository.find();
    result.data = data
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`
    return c.json(result)
  }
});

app.get('/test2', async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    const testRepository = AppDataSource.getRepository(TTest1Child);
    const data = await testRepository.find();
    result.data = data
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`
    return c.json(result)
  }
});
app.post('/save', async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    // body 에서 데이터 꺼내기
    const body = await c?.req?.json();
    let title = body?.title ?? "";
    let content = body?.content ?? "";
    const testRepository = AppDataSource.getRepository(TTest1);
    // 새로운 데이터 만들기
    let newData = new TTest1();
    newData.title = title;
    newData.content = content;
    // 새로운 데이터 저장 commit
    let data = await testRepository.save(newData);
    result.data = data
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`
    return c.json(result)
  }
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

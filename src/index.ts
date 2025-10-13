import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { AppDataSource } from "./data-source1.js";
import { cors } from "hono/cors";
import * as dotenv from "dotenv";
import { TTest1 } from "./entities/TTest1.js";
import { error } from "console";
import { TTest1Child } from "./entities/TTest1Child.js";
import fileRouter from "./routes/file_router.js";
import testRouter from "./routes/test_router.js";

import { LMStudioClient } from "@lmstudio/sdk";
const client = new LMStudioClient();

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: envFile });

const app = new Hono();

app.use(cors());

/** DB 연결 */
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
/** DB 연결 END */

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

/**
 c 라는 놈 : 요청, 응답을 가지고 있는 객체
 async : 비동기 환경에서, db 접속같이 시간이 걸리는것도
 기다리게 해주는놈
 */
app.get("/api/test", async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    const q = String(c.req.query("q") ?? "");
    const model = await client.llm.model("google/gemma-3-1B");
    const result = await model.respond(q);
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`;
    return c.json(result);
  }
});

app.get("/test2", async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    const testRepository = AppDataSource.getRepository(TTest1);
    const data = await testRepository.find({
      relations: { tTest1Children: true },
    });
    result.data = data;
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`;
    return c.json(result);
  }
});

app.get("/raw_query", async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    let data = await AppDataSource.sql`
SELECT
t1.id
,t1.title
,t1.content
,t1.created_dt
,COALESCE(
  json_agg(
    json_build_object(
      't1c_id', t1c.id,
      
      't1c_comment', t1c.comment,
      't1c_created_dt', t1c.created_dt
    )
  ) FILTER (WHERE t1c.id IS NOT NULL),
  '[]'
) AS childs

FROM t_test1 AS t1
LEFT JOIN t_test1_child t1c ON t1.id = t1c.test1_id
WHERE 1=1
GROUP BY t1.id
ORDER BY t1.id ASC
OFFSET (${1} - 1) * ${100}
LIMIT ${100}
    `;
    result.data = data;
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`;
    return c.json(result);
  }
});

/**
 C : 요청, 응답을 기능들이 있는 객체 
 */
app.post("/api/save", async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    // body 에서 데이터 꺼내기
    const body = await c?.req?.json();
    let id = Number(body?.id ?? 0);
    let title = String(body?.title ?? "");
    let content = String(body?.content ?? "");
    let items = body?.items;
    console.log(`items : `, items);
    const testRepository = AppDataSource.getRepository(TTest1);

    /**
    TTest1 테이블에서 id 가 body에서 받은 id랑 똑같은 값을 가진 데이터를 하나 찾아와.
    없으면, 그냥 데이터 새로 만들어.
     */
    let oldData =
      (await testRepository.findOne({ where: { id: id } })) ?? new TTest1();
    // 예외처리
    if (id && !oldData?.id) {
      result.success = false;
      result.message = `없는 데이터를 수정하려고 합니다. 반려 처리 하겠습니다`;
      return c.json(result);
    }

    oldData.title = title;
    oldData.content = content;

    // 새로운 데이터 저장 commit
    let data = await testRepository.save(oldData);
    result.data = data;
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`;
    return c.json(result);
  }
});

app.post("/delete", async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    // body 에서 데이터 꺼내기
    const body = await c?.req?.json();
    let id = Number(body?.id ?? 0);
    const testRepository = AppDataSource.getRepository(TTest1);
    await testRepository.delete({ id: id });
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`;
    return c.json(result);
  }
});

app.route("/api/file", fileRouter);
app.route("/api/test", testRouter);

serve(
  {
    fetch: app.fetch,
    port: 7860,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

import { Hono } from "hono";
import { GoogleGenAI } from "@google/genai";
import { streamText } from "hono/streaming";
import { z } from "zod";
//@ts-ignore
import path from "path";
import { AppDataSource } from "../data-source1";
import { TFiles } from "../entities/TFiles";

const router = new Hono();

const MODEL = "gemini-2.5-flash"; // 필요 시 'gemini-2.5-flash-lite'로 교체 가능
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

router.get("/", async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    const q = String(c.req.query("q") ?? "");
    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`;
    return c.json(result);
  }
});

interface EmbeddingResponse {
  success: boolean;
  data: number[][]; // 임베딩 벡터 (배열의 배열)
  msg: string;
}
router.get("/save_embedding_to_db", async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    const queryText = String(c.req.query("q") ?? "기본 쿼리 텍스트"); // 쿼리 파라미터 'q'를 사용

    // 1. 외부 API URL 및 요청 Body 설정
    const apiUrl =
      "https://wildojisan-embeddinggemma-300m-fastapi.hf.space/make_text_embedding";
    const requestBody = {
      query: queryText,
      documents: [queryText], // 쿼리 텍스트와 동일한 문서를 임베딩하도록 설정
    };

    // 2. 외부 API에 POST 요청 보내기
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // 3. 응답 상태 코드 확인 및 오류 처리
    if (!response.ok) {
      throw new Error(`API 요청 실패. HTTP 상태 코드: ${response.status}`);
    }

    // 4. 응답 본문 파싱
    const apiResponse: EmbeddingResponse = await response.json();

    // 5. 파싱된 데이터 확인 및 처리
    if (
      apiResponse.success &&
      apiResponse.data &&
      apiResponse.data.length > 0
    ) {
      // 임베딩 벡터 (첫 번째 문서의 임베딩)
      const embeddingVector = apiResponse.data[0];

      // =======================================================
      // ⭐️ AppDataSource.query()를 사용한 Raw SQL 저장 로직
      // =======================================================

      // 1. 벡터 배열을 pgvector가 인식할 수 있는 문자열 형식으로 변환합니다.
      //    예: [0.12, -0.45, 0.78, ...]  ->  '[0.12, -0.45, 0.78]'
      const vectorString = `[${embeddingVector.join(",")}]`;

      // 2. Raw INSERT 쿼리 실행
      const insertQuery = `
                INSERT INTO t_vector_test1 (content, embedding)
                VALUES ($1, $2)
                RETURNING id;
            `;

      // AppDataSource.query()를 사용하여 쿼리를 실행합니다.
      // 첫 번째 인자는 SQL 쿼리, 두 번째 인자는 플레이스홀더에 바인딩할 값들의 배열입니다.
      const dbResult = await AppDataSource.query(insertQuery, [
        queryText,
        vectorString,
      ]);

      // AppDataSource.query()는 배열 형태의 결과를 반환합니다.
      const newId = dbResult[0]?.id;

      // =======================================================

      result.data = {
        query: queryText,
        vector_length: embeddingVector.length,
        first_5_values: embeddingVector.slice(0, 5), // 데이터 확인용으로 앞 5개만 반환
      };
      result.message = `임베딩을 성공적으로 받아왔습니다. 벡터 길이: ${embeddingVector.length}`;
    } else {
      // API 응답은 성공(HTTP 200)했지만, 내부 success 플래그가 false인 경우
      throw new Error(
        `임베딩 API 내부 오류: ${apiResponse.msg || "알 수 없는 응답"}`
      );
    }

    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`;
    return c.json(result);
  }
});

router.get("/postgres_embedding_search", async (c) => {
  let result: { success: boolean; data: any; code: string; message: string } = {
    success: true,
    data: null,
    code: "",
    message: ``,
  };
  try {
    const queryText = String(c.req.query("q") ?? "기본 쿼리 텍스트"); // 쿼리 파라미터 'q'를 사용

    // 1. 외부 API URL 및 요청 Body 설정
    const apiUrl =
      "https://wildojisan-embeddinggemma-300m-fastapi.hf.space/make_text_embedding";
    const requestBody = {
      query: queryText,
      documents: [queryText], // 쿼리 텍스트와 동일한 문서를 임베딩하도록 설정
    };

    // 2. 외부 API에 POST 요청 보내기
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // 3. 응답 상태 코드 확인 및 오류 처리
    if (!response.ok) {
      throw new Error(`API 요청 실패. HTTP 상태 코드: ${response.status}`);
    }

    // 4. 응답 본문 파싱
    const apiResponse: EmbeddingResponse = await response.json();

    // 5. 파싱된 데이터 확인 및 처리
    if (
      apiResponse.success &&
      apiResponse.data &&
      apiResponse.data.length > 0
    ) {
      // 임베딩 벡터 (첫 번째 문서의 임베딩)
      const embeddingVector = apiResponse.data[0];

      // =======================================================
      // ⭐️ AppDataSource.query()를 사용한 Raw SQL 저장 로직
      // =======================================================

      // 1. 벡터 배열을 pgvector가 인식할 수 있는 문자열 형식으로 변환합니다.
      //    예: [0.12, -0.45, 0.78, ...]  ->  '[0.12, -0.45, 0.78]'
      const vectorString = `[${embeddingVector.join(",")}]`;

      // 코사인 유사도 0.8 이상인 레코드를 찾는 쿼리 (코사인 거리 0.2 이하) 코사인 유사도가 1.0 (완전히 동일) → 코사인 거리는 0.0
      const selectQuery = `
    SELECT
        id,
        content,
        embedding <=> $1 AS distance_score 
    FROM
        t_vector_test1
    WHERE
      (embedding <=> $1 ) <= 0.2 
    ORDER BY
        distance_score ASC
    LIMIT 10;
`;

      // AppDataSource.query()를 사용하여 쿼리를 실행하고 바인딩합니다.
      let dbResult = await AppDataSource.query(selectQuery, [
        vectorString, // $1에 이 쿼리 벡터 문자열을 바인딩하여 전달합니다.
      ]);

      // AppDataSource.query()는 배열 형태의 결과를 반환합니다.
      dbResult = dbResult[0];

      // =======================================================

      result.data = dbResult;
    } else {
      // API 응답은 성공(HTTP 200)했지만, 내부 success 플래그가 false인 경우
      throw new Error(
        `임베딩 API 내부 오류: ${apiResponse.msg || "알 수 없는 응답"}`
      );
    }

    return c.json(result);
  } catch (error: any) {
    result.success = false;
    result.message = `error. ${error?.message ?? ""}`;
    return c.json(result);
  }
});

// --- 1) 단발성(비스트리밍) ---
const generateSchema = z.object({
  prompt: z.string().min(1),
  // 멀티모달: data URL or 공개 URL을 넣을 때는 files API를 쓰는 방법이 가장 안전합니다.
  // 여기선 단순 예시로 텍스트만 받습니다.
});
router.post("/generate", async (c) => {
  const body = await c.req.json();
  const { prompt } = generateSchema.parse(body);

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    // 옵션 예시:
    // config: { temperature: 0.7, maxOutputTokens: 1024 }
  });

  // text()는 편의 접근자
  return c.json({ text: res.text });
});

// --- 2) 스트리밍 ---
// 콘솔/터미널로 청크가 오자마자 밀어주는 간단 스트림
router.post("/chat/stream", async (c) => {
  const { prompt } = await c.req.json();
  if (typeof prompt !== "string" || !prompt.trim()) {
    return c.json({ error: "prompt required" }, 400);
  }

  const stream = await ai.models.generateContentStream({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    // config: { temperature: 0.7 }
  });

  return streamText(c, async (writer) => {
    for await (const chunk of stream) {
      // chunk.text 는 누적이 아니라 "이번 청크의 텍스트"
      const piece = chunk.text ?? "";
      if (piece) await writer.write(piece);
    }
  });
});

// --- 3) 대화 히스토리(간단) ---
// 클라이언트가 이전 대화 로그를 넘기면 멀티턴으로 처리
const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model"]), // 'model'은 이전 응답을 의미
        content: z.string().min(1),
      })
    )
    .min(1),
});
router.post("/chat", async (c) => {
  const { messages } = chatSchema.parse(await c.req.json());
  // SDK가 알아먹는 형태로 변환
  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const res: any = await ai.models.generateContent({
    model: MODEL,
    contents,
  });
  return c.json({ text: res.text });
});

export default router;

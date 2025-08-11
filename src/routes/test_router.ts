import { Hono } from 'hono';
import { GoogleGenAI } from '@google/genai'
import { streamText } from 'hono/streaming'
import { z } from 'zod'
//@ts-ignore
import path from "path";
import { AppDataSource } from '../data-source1';
import { TFiles } from '../entities/TFiles';

const router = new Hono();

const MODEL = 'gemini-2.5-flash' // 필요 시 'gemini-2.5-flash-lite'로 교체 가능
const apiKey = process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey })

router.get('/', async (c) => {
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
        result.message = `error. ${error?.message ?? ""}`
        return c.json(result)
    }
});

// --- 1) 단발성(비스트리밍) ---
const generateSchema = z.object({
    prompt: z.string().min(1),
    // 멀티모달: data URL or 공개 URL을 넣을 때는 files API를 쓰는 방법이 가장 안전합니다.
    // 여기선 단순 예시로 텍스트만 받습니다.
})
router.post('/generate', async c => {
    const body = await c.req.json()
    const { prompt } = generateSchema.parse(body)

    const res = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        // 옵션 예시:
        // config: { temperature: 0.7, maxOutputTokens: 1024 }
    })

    // text()는 편의 접근자
    return c.json({ text: res.text })
})

// --- 2) 스트리밍 ---
// 콘솔/터미널로 청크가 오자마자 밀어주는 간단 스트림
router.post('/chat/stream', async c => {
    const { prompt } = await c.req.json()
    if (typeof prompt !== 'string' || !prompt.trim()) {
        return c.json({ error: 'prompt required' }, 400)
    }

    const stream = await ai.models.generateContentStream({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        // config: { temperature: 0.7 }
    })

    return streamText(c, async (writer) => {
        for await (const chunk of stream) {
            // chunk.text 는 누적이 아니라 "이번 청크의 텍스트"
            const piece = chunk.text ?? ''
            if (piece) await writer.write(piece)
        }
    })
})

// --- 3) 대화 히스토리(간단) ---
// 클라이언트가 이전 대화 로그를 넘기면 멀티턴으로 처리
const chatSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'model']), // 'model'은 이전 응답을 의미
        content: z.string().min(1),
    })).min(1)
})
router.post('/chat', async c => {
    const { messages } = chatSchema.parse(await c.req.json())
    // SDK가 알아먹는 형태로 변환
    const contents = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    }))

    const res: any = await ai.models.generateContent({
        model: MODEL,
        contents
    })
    return c.json({ text: res.text })
})

export default router;
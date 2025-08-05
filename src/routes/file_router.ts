import { Hono } from 'hono';
import { mkdirSync, writeFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";
//@ts-ignore
import path from "path";
import { AppDataSource } from '../data-source1';
import { TFiles } from '../entities/TFiles';

const router = new Hono();

// ✅ 업로드 디렉토리 생성
const uploadDir = path.resolve("./uploads");
mkdirSync(uploadDir, { recursive: true });

interface FileMeta {
    original_name: string;    // 원본 파일명
    stored_name: string;      // 저장된 파일명 (UUID 등)
    file_path: string;        // 서버 상의 경로
    mime_type: string;        // MIME 타입 (예: image/png)
    file_size: number;        // 파일 크기 (바이트 단위)
}

router.post('/local_upload', async (c) => {
    let result: { success: boolean; data: any; code: string; message: string } = {
        success: true,
        data: null,
        code: "",
        message: ``,
    };
    try {
        //const testRepository = AppDataSource.getRepository(TTest1);
        // formData 에서 데이터 꺼내기
        const body = await c?.req?.formData();

        // 1. Authorization 헤더 처리
        let authHeader = c.req.header("Authorization") ?? "";
        try {
            authHeader = authHeader.split("Bearer ")[1];
        } catch (error) {
            authHeader = "";
        }

        // // 2. 토큰 검증
        // const tokenData: any = verifyToken(authHeader);
        // if (!tokenData?.idp) {
        //     // result.success = false;
        //     // result.message = "로그인이 필요합니다";
        //     // return c.json(result);
        // }

        // 데이터 타입이 formData 인 body 변수에서 name 꺼냄
        let title = String(body.get("name"));

        const images: any = body.getAll("images");
        console.log(`## images:`, images);
        let imageUrlList: FileMeta[] = [];
        for (const img of images) {
            const fileBlob = img as File;
            //console.log(img.name);// 1. 파일을 ArrayBuffer로 읽고 Buffer로 변환
            const arrayBuffer = await img.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Image = buffer.toString("base64");

            const originalName = fileBlob?.name ?? "";
            const storedName = uuidv4() + path.extname(originalName);
            const filePath = path.join(uploadDir, storedName);
            const mimeType = fileBlob.type;
            const fileSize = fileBlob.size;
            // ✅ 디스크에 파일 저장
            writeFileSync(filePath, buffer);

            /**
             * interface FileMeta {
    original_name: string;    // 원본 파일명
    stored_name: string;      // 저장된 파일명 (UUID 등)
    file_path: string;        // 서버 상의 경로
    mime_type: string;        // MIME 타입 (예: image/png)
    file_size: number;        // 파일 크기 (바이트 단위)
}
             */
            imageUrlList.push({
                original_name: originalName,
                stored_name: storedName,
                file_path: filePath,
                mime_type: mimeType,
                file_size: fileSize,
            });

        }
        console.log(`## imageUrlList: `, imageUrlList)
        if (imageUrlList && imageUrlList?.length > 0) {
            // db 에 데이터 저장하기
            const fileRepository = AppDataSource.getRepository(TFiles)
        }
        return c.json(result);
    } catch (error: any) {
        result.success = false;
        result.message = `error. ${error?.message ?? ""}`
        return c.json(result)
    }
});

router.get('/:id', (c) => {
    const id = c.req.param('id');
    return c.text(`👤 유저 상세: ${id}`);
});

export default router;
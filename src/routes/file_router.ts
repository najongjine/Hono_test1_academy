import { Hono } from 'hono';

const router = new Hono();

router.get('/local_upload', async (c) => {
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

        // 2. 토큰 검증
        const tokenData: any = verifyToken(authHeader);
        if (!tokenData?.idp) {
            // result.success = false;
            // result.message = "로그인이 필요합니다";
            // return c.json(result);
        }

        // 데이터 타입이 formData 인 body 변수에서 name 꺼냄
        let title = String(body.get("name"));
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
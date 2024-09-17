import { APIRequestContext, expect } from "playwright/test";

export async function getToken(request: APIRequestContext): Promise<string> {
    const authPayload = {
        "username" : "admin",
        "password" : "password123"
    };
    const tokenResponse = await request.post('https://restful-booker.herokuapp.com/auth', {data: authPayload});
    await expect(tokenResponse).toBeOK();
    const tokenResponseJson = await tokenResponse.json();
    return tokenResponseJson.token;
}

export function getHeader(token: string): Record<string, string> {
    return {
        'Cookie': `token=${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}
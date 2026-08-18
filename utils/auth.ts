import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = new TextEncoder().encode(process.env.ENCRYPTION_KEY);

export interface JWTPayload {
	userId: string;
	email: string;
	role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
	return await new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
	try {
		const { payload } = await jwtVerify(token, SECRET_KEY, {
			algorithms: ['HS256'],
		});
		return payload as unknown as JWTPayload;
	} catch {
		return null;
	}
}

export async function getSession(req: NextRequest): Promise<JWTPayload | null> {
	const token = req.cookies.get('session')?.value;
	if (!token) return null;
	return verifyToken(token);
}

export function setSessionCookie(res: NextResponse, token: string) {
	res.cookies.set('session', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/',
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});
}

export function deleteSessionCookie(res: NextResponse) {
	res.cookies.delete('session');
}

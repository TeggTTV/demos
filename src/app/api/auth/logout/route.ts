import { NextResponse } from 'next/server';
import { deleteSessionCookie } from '@/../utils/auth';

export async function POST() {
	const response = NextResponse.json({ success: true });
	deleteSessionCookie(response);
	return response;
}

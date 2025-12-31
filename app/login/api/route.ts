export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { authenticateUser } from '../logic/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    let user = await authenticateUser(email, password);
    if (!user && process.env.NODE_ENV === 'development') {
      if (email === 'test@gmail.com' && password === 'test123') {
        user = { id: '1', email, name: 'Test User' };
      }
    }
    if (!user) {
      return NextResponse.json(
        { message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const devSecret = (globalThis as any).__DEV_JWT_SECRET ?? crypto.randomBytes(32).toString('hex');
    if (!(globalThis as any).__DEV_JWT_SECRET) (globalThis as any).__DEV_JWT_SECRET = devSecret;
    const jwtSecret = process.env.JWT_SECRET || devSecret;

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      jwtSecret,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({
      user,
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;

  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt:', email);

    // DUMMY LOGIN - untuk testing
    // Nanti ganti dengan database real
    if (email === 'test@gmail.com' && password === 'test123') {
      const token = 'dummy-token-' + Date.now();
      
      const response = NextResponse.json({
        user: {
          id: '1',
          email: email,
          name: 'Test User'
        },
        token: token
      });

      // Set cookie (optional)
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { message: 'Email atau password salah' },
      { status: 401 }
    );

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}
'use client';

// Tidak perlu API_URL karena pakai Next.js route

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch('/login/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Koneksi ke server gagal');
    }
  },
};

export default api;

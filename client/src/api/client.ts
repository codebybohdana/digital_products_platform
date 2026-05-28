import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clear token on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

export function getCoverUrl(coverPath: string): string {
  const filename = coverPath.split('/').pop() ?? '';
  const origin = new URL(import.meta.env.VITE_API_URL as string).origin;
  return `${origin}/uploads/covers/${filename}`;
}

export async function triggerDownload(productId: number, fileName: string): Promise<void> {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL as string;
  const res = await fetch(`${apiUrl}/files/download/${productId}`, {
    headers: { Authorization: `Bearer ${token ?? ''}` },
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
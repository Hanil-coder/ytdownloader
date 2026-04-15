const API_BASE_URL = '/api';

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  view_count: number;
  description: string;
}

export interface DownloadResponse {
  status: string;
  download_url: string;
  title: string;
  filename: string;
}

export const getInfo = async (url: string): Promise<VideoInfo> => {
  const response = await fetch(`${API_BASE_URL}/info?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch video info');
  }
  return response.json();
};

export const downloadVideo = async (url: string): Promise<DownloadResponse> => {
  const response = await fetch(`${API_BASE_URL}/download?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to download video');
  }
  return response.json();
};

export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

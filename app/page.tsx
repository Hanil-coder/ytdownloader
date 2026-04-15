'use client';

import { useState } from 'react';
import { getInfo, downloadVideo, VideoInfo, DownloadResponse, formatDuration } from '@/lib/api';

export default function Home() {
  const [url, setUrl] = useState('');
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setInfo(null);

    try {
      const data = await getInfo(url);
      setInfo(data);
    } catch (err: any) {
      setError(err.message || '영상을 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url) return;

    setDownloading(true);
    setError('');

    try {
      const data = await downloadVideo(url);
      // 브라우저에서 다운로드 트리거
      const link = document.createElement('a');
      link.href = data.download_url;
      link.setAttribute('download', data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err.message || '다운로드에 실패했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            YouTube Downloader
          </h1>
          <p className="text-lg text-gray-600">
            유튜브 URL을 입력하고 MP4 파일로 다운로드하세요.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
          <form onSubmit={handleFetchInfo} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 min-w-0 block w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-red-500 focus:border-red-500 text-gray-900"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
              >
                {loading ? '불러오는 중...' : '정보 확인'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {info && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <img
                    src={info.thumbnail}
                    alt={info.title}
                    className="w-full h-auto rounded-xl shadow-sm object-cover"
                  />
                </div>
                <div className="md:w-1/2 space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {info.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    업로더: <span className="font-semibold text-gray-700">{info.uploader}</span>
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <p>길이: <span className="font-semibold text-gray-700">{formatDuration(info.duration)}</span></p>
                    <p>조회수: <span className="font-semibold text-gray-700">{info.view_count.toLocaleString()}회</span></p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full flex justify-center items-center px-6 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                >
                  {downloading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      다운로드 준비 중...
                    </>
                  ) : (
                    'MP4로 다운로드 시작'
                  )}
                </button>
                <p className="mt-4 text-center text-xs text-gray-400">
                  다운로드를 시작하면 서버에서 변환 작업이 진행됩니다. 잠시만 기다려 주세요.
                </p>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-gray-400 text-sm">
          &copy; 2024 ytdownloader. All rights reserved.
        </footer>
      </div>
    </main>
  );
}

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import os
import uuid
import time
import asyncio
from pathlib import Path

app = FastAPI()

# CORS 설정 (프론트엔드 연결 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 다운로드 디렉토리 설정 (Vercel에서는 /tmp만 쓰기 가능)
DOWNLOAD_DIR = Path("/tmp/ytdownloader")
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

# 정적 파일 서빙 (로컬 테스트용)
if os.path.exists(DOWNLOAD_DIR):
    app.mount("/files", StaticFiles(directory=DOWNLOAD_DIR), name="files")

async def cleanup_file(file_path: Path, delay: int = 600):
    """10분 후 파일 삭제"""
    await asyncio.sleep(delay)
    try:
        if file_path.exists():
            os.remove(file_path)
            print(f"Cleaned up file: {file_path}")
    except Exception as e:
        print(f"Error cleaning up file: {e}")

@app.get("/info")
async def get_info(url: str):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return {
                "title": info.get("title"),
                "thumbnail": info.get("thumbnail"),
                "duration": info.get("duration"),
                "uploader": info.get("uploader"),
                "view_count": info.get("view_count"),
                "description": info.get("description")[:200] if info.get("description") else ""
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/download")
async def download_video(url: str, request: Request, background_tasks: BackgroundTasks):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    file_id = str(uuid.uuid4())
    filename_template = f"{DOWNLOAD_DIR}/{file_id}.%(ext)s"
    
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': filename_template,
        'quiet': True,
        'merge_output_format': 'mp4',
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # 실제 다운로드 수행
            info = ydl.extract_info(url, download=True)
            # 최종 파일명 확인 (확장자 때문)
            ext = info.get("ext", "mp4")
            filename = f"{file_id}.{ext}"
            file_path = DOWNLOAD_DIR / filename
            
            if not file_path.exists():
                 # 확장자가 다른 경우를 대비해 폴더 뒤져서 찾기
                 for f in DOWNLOAD_DIR.iterdir():
                     if f.name.startswith(file_id):
                         filename = f.name
                         file_path = f
                         break

            # 백그라운드에서 파일 삭제 예약
            background_tasks.add_task(cleanup_file, file_path)

            # 외부에서 접근 가능한 URL 생성
            # Vercel 환경에서는 직접 파일을 서빙하기보다 
            # 이 엔드포인트에서 FileResponse를 반환하거나 하는 방식이 나을 수 있지만
            # 일단 요구사항대로 URL 반환 방식을 유지하기 위해 /api/file/{filename} 형태로 구성 가능
            base_url = str(request.base_url).rstrip("/")
            download_url = f"{base_url}/file/{filename}"
            
            return {
                "status": "success",
                "download_url": download_url,
                "title": info.get("title"),
                "filename": filename
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/file/{filename}")
async def get_file(filename: str):
    file_path = DOWNLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or already deleted")
    return FileResponse(path=file_path, filename=filename, media_type='video/mp4')

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

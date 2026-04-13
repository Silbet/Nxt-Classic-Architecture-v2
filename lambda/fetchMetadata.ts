/**
 * Lambda 1: iTunes Search API로 앨범명 + 커버 이미지 가져오기
 *
 * 트리거: S3 audio/ 경로에 mp3 업로드 시
 * 흐름: trackId 추출 → GET /api/tracks/:id → iTunes 검색 → PATCH /api/tracks/:id
 */
import type { S3Event } from 'aws-lambda';

const API_URL = process.env.API_URL ?? '';

// iTunes가 붙이는 suffix 제거 (예: "앨범명 - EP", "Drama - The 4th Mini Album")
function cleanAlbumName(name: string): string {
  const idx = name.lastIndexOf(' - ');
  if (idx === -1) return name;
  return name.slice(0, idx);
}

interface ItunesResult {
  artist: string;
  album: string;
  coverUrl: string;
}

async function searchItunes(title: string, artist: string): Promise<ItunesResult | null> {
  const term = encodeURIComponent(`${title} ${artist}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&limit=1&country=KR`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes 검색 실패: ${res.status}`);

  const data = await res.json();
  const item = data.results?.[0];
  if (!item) return null;

  return {
    artist: item.artistName,
    album: cleanAlbumName(item.collectionName),
    // artworkUrl100을 600x600으로 교체 (iTunes URL 패턴)
    coverUrl: item.artworkUrl100.replace('100x100bb', '600x600bb'),
  };
}

async function getTrack(trackId: string): Promise<{ title: string; artist: string }> {
  const res = await fetch(`${API_URL}/api/tracks/${trackId}`);
  if (!res.ok) throw new Error(`트랙 조회 실패: ${res.status}`);
  return res.json();
}

async function patchTrack(trackId: string, payload: { artist: string; album: string; coverUrl: string }) {
  const res = await fetch(`${API_URL}/api/tracks/${trackId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PATCH 실패: ${res.status}`);
}

export async function handler(event: S3Event): Promise<void> {
  for (const record of event.Records) {
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    const match = key.match(/^audio\/([^/]+)\.mp3$/);
    if (!match) {
      console.log(`스킵: ${key}`);
      continue;
    }
    const trackId = match[1];
    console.log(`메타데이터 처리 시작: trackId=${trackId}`);

    try {
      const { title, artist } = await getTrack(trackId);
      const result = await searchItunes(title, artist);

      if (result) {
        await patchTrack(trackId, result);
        console.log(`메타데이터 업데이트 완료: trackId=${trackId}`, result);
      } else {
        console.log(`iTunes 검색 결과 없음: trackId=${trackId}`);
      }
    } catch (err) {
      console.error(`메타데이터 처리 실패: trackId=${trackId}`, err);
      throw err;
    }
  }
}

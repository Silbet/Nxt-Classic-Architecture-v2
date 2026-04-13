/**
 * Lambda 2: mp3 파일에서 duration 추출
 *
 * 트리거: S3 audio/ 경로에 mp3 업로드 시
 * 흐름: trackId 추출 → S3에서 mp3 앞부분 읽기 → duration 파싱 → PATCH /api/tracks/:id
 */
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { parseBuffer } from 'music-metadata';
import type { SNSEvent } from 'aws-lambda';

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'ap-northeast-2' });
const BUCKET = process.env.AWS_S3_BUCKET ?? '';
const API_URL = process.env.API_URL ?? '';

// ID3 헤더 + VBR/Xing 헤더는 앞부분에 있으므로 512KB면 충분
const RANGE_BYTES = 512 * 1024;

async function fetchPartialMp3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Range: `bytes=0-${RANGE_BYTES - 1}`,
  });
  const response = await s3.send(command);
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function patchTrack(trackId: string, duration: number) {
  const res = await fetch(`${API_URL}/api/tracks/${trackId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ duration }),
  });
  if (!res.ok) throw new Error(`PATCH 실패: ${res.status}`);
}

export async function handler(event: SNSEvent): Promise<void> {
  for (const record of event.Records) {
    // SNS 메시지 안에 S3 이벤트 JSON이 문자열로 들어있음
    const s3Event = JSON.parse(record.Sns.Message);
    const s3Record = s3Event.Records?.[0];
    if (!s3Record) continue;

    const key = decodeURIComponent(s3Record.s3.object.key.replace(/\+/g, ' '));

    const match = key.match(/^audio\/([^/]+)\.mp3$/);
    if (!match) {
      console.log(`스킵: ${key}`);
      continue;
    }
    const trackId = match[1];
    console.log(`duration 추출 시작: trackId=${trackId}`);

    try {
      const buffer = await fetchPartialMp3(key);
      const metadata = await parseBuffer(buffer, { mimeType: 'audio/mpeg' });
      const duration = Math.round(metadata.format.duration ?? 0);

      if (duration > 0) {
        await patchTrack(trackId, duration);
        console.log(`duration 업데이트 완료: trackId=${trackId}, ${duration}초`);
      } else {
        console.log(`duration 추출 실패 (0): trackId=${trackId}`);
      }
    } catch (err) {
      console.error(`duration 처리 실패: trackId=${trackId}`, err);
      throw err;
    }
  }
}

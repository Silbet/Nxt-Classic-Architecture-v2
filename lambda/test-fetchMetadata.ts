/**
 * fetchMetadata 로컬 테스트
 * 사용법: npx ts-node test-fetchMetadata.ts <trackId>
 *
 * 사전 조건:
 * - lambda/.env 파일에 API_URL 설정
 * - 백엔드 로컬 실행 중 (npm run dev)
 * - DB에 해당 trackId의 트랙이 존재해야 함
 */
import 'dotenv/config';
import { handler } from './fetchMetadata';
import type { S3Event } from 'aws-lambda';

const trackId = process.argv[2];
if (!trackId) {
  console.error('사용법: npx ts-node test-fetchMetadata.ts <trackId>');
  process.exit(1);
}

const fakeEvent: S3Event = {
  Records: [
    {
      s3: {
        object: { key: `audio/${trackId}.mp3` },
      },
    } as any,
  ],
};

console.log(`\n테스트 시작: trackId=${trackId}`);
console.log(`API_URL: ${process.env.API_URL}\n`);

handler(fakeEvent)
  .then(() => console.log('\n테스트 완료'))
  .catch((err) => {
    console.error('\n테스트 실패:', err);
    process.exit(1);
  });

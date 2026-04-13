/**
 * extractDuration 로컬 테스트
 * 사용법: npx ts-node test-extractDuration.ts <trackId>
 *
 * 사전 조건:
 * - lambda/.env 파일에 API_URL, AWS_REGION, AWS_S3_BUCKET 설정
 * - AWS 자격증명 설정 (aws configure 또는 환경변수)
 * - 백엔드 로컬 실행 중 (npm run dev)
 * - S3에 audio/{trackId}.mp3 파일이 존재해야 함
 */
import 'dotenv/config';
import { handler } from './extractDuration';
import type { S3Event } from 'aws-lambda';

const trackId = process.argv[2];
if (!trackId) {
  console.error('사용법: npx ts-node test-extractDuration.ts <trackId>');
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
console.log(`API_URL: ${process.env.API_URL}`);
console.log(`S3 버킷: ${process.env.AWS_S3_BUCKET}\n`);

handler(fakeEvent)
  .then(() => console.log('\n테스트 완료'))
  .catch((err) => {
    console.error('\n테스트 실패:', err);
    process.exit(1);
  });

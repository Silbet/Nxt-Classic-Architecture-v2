import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'ap-northeast-2',
});

export const BUCKET = process.env.AWS_S3_BUCKET ?? '';

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    },
  });

  await upload.done();
  return `https://${BUCKET}.s3.${process.env.AWS_REGION ?? 'ap-northeast-2'}.amazonaws.com/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

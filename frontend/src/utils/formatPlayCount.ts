/**
 * 조회수 포맷
 * 1~999: 숫자 그대로 (e.g. 42)
 * 1000~9999: x.x천 (e.g. 3.3천, 9천)
 * 10000+: 1만+ 등 (확장 대비)
 */
export function formatPlayCount(count: number): string {
  if (count < 1000) return `${count}회 재생`;
  if (count < 10000) {
    const tenths = Math.floor(count / 100) / 10;
    const formatted = tenths % 1 === 0 ? `${tenths}천` : `${tenths}천`;
    return `${formatted}회 재생`;
  }
  return `${Math.floor(count / 10000)}만+회 재생`;
}

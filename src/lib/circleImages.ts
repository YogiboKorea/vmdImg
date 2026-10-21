// 썸네일 오른쪽 위 원형 이미지 — 컬러칩 이미지처럼 상품명으로 코드에서 찾아 넣음 (엑셀 입력 없음).
// 키는 공백을 뺀 상품명 일부: 상품명(공백 제거)에 키가 들어 있으면 해당 이미지 + 테두리 색.
// 이미지는 컬러칩과 같은 cafe24 /web/img/goods/color_chip/ 에 올려 둠.
const CHIP_BASE = 'https://yogibo.openhost.cafe24.com/web/img/goods/color_chip';
const chip = (file: string) => {
  const dot = file.lastIndexOf('.');
  return `${CHIP_BASE}/${encodeURIComponent(file.slice(0, dot))}${file.slice(dot)}`;
};

const CIRCLE_IMAGES: { key: string; image: string; border: string }[] = [
  { key: '프리미엄리필비즈', image: chip('프리미엄리필비즈.png'), border: '#CDAFFF' },
  { key: '스탠다드리필비즈', image: chip('스탠다드리필비즈.jpg'), border: '#92D7E6' },
];

// 원본이 클 수 있어(스탠다드 4096×2731) 이 크기(정사각, cover)로 줄여 씀 — A타입 지름 288 보다 넉넉하게
export const CIRCLE_IMAGE_PX = 400;

export function getCircleImage(productName: string): { image: string; border: string } | null {
  const name = (productName || '').replace(/\s+/g, '');
  const hit = CIRCLE_IMAGES.find((c) => name.includes(c.key));
  return hit ? { image: hit.image, border: hit.border } : null;
}

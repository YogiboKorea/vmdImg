// 썸네일 위 yogibo 로고 — 로고 자리가 어두운 썸네일은 흰 로고로 (판단은 lib/logoTone, 서버 전용)
export const LOGO_URL = 'https://yogibo.openhost.cafe24.com/web/img/icon/logo3_on.png';
export const LOGO_WHITE_URL = 'https://yogibo.openhost.cafe24.com/web/img/icon/logo3_off.png'; // 같은 크기 흰색 로고

// 로고가 놓이는 영역 — 정사각 썸네일(cover) 대비 비율. B타입(500 썸네일: x 30, 아래 15, 150×60) 기준,
// A타입(640 썸네일: x 38, 아래 19, 188×75)도 같은 비율.
export const LOGO_AREA = { left: 0.06, top: 0.85, width: 0.3, height: 0.12 };

// 썸네일에 로고를 넣지 않는 상품 — 공백 뺀 상품명에 들어 있으면 (디자인 요청: 리필 비즈)
const NO_LOGO_PRODUCTS = ['스탠다드리필비즈', '프리미엄리필비즈'];

export function showsLogo(productName: string): boolean {
  const name = (productName || '').replace(/\s+/g, '');
  return !NO_LOGO_PRODUCTS.some((key) => name.includes(key));
}

// 로고 영역 평균 밝기(0~1)가 이보다 낮으면 흰 로고.
// 실제 상품 이미지 측정: 카터필러 롤 맥스 0.16 · 요기보 맥스 0.36 (어두움) / 서포트 0.57 · 코지보 0.60 · 냅 0.71 · 롤 메이트 0.88
export const LOGO_DARK_THRESHOLD = 0.45;

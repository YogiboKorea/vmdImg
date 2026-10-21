import { ProductData, BeadType, BeadPrice, IMAGE_SPECS, customBaseType } from '@/types/product';
import { getCircleImage, CIRCLE_IMAGE_PX } from '@/lib/circleImages';
import { LOGO_URL, LOGO_WHITE_URL } from '@/lib/logo';

export function imgUrl(filename: string): string {
  if (!filename) return '';
  const trimmed = filename.trim();
  // 사용자가 직접 업로드한 base64 data URL — 그대로 사용
  if (trimmed.startsWith('data:')) return trimmed;
  // Cafe24 lookup으로 들어온 절대 URL은 그대로 사용
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // 프로토콜 상대 URL ("//yogibo.kr/...")
  if (trimmed.startsWith('//')) return 'https:' + trimmed;
  // 파일명만 들어온 경우 — FTP 폴백.
  // 한글/공백 등을 안전하게 인코딩하고, http→https 리디렉션 회피를 위해 처음부터 https 사용.
  const clean = trimmed.replace(/^\/+/, '');
  const parts = clean.split('.');
  const ext = parts.length > 1 ? parts.pop()! : '';
  const encoded = parts.map(encodeURIComponent).join('.') + (ext ? `.${ext}` : '');
  return `https://yogibo.openhost.cafe24.com/web/vmd/${encoded}`;
}

const COLOR_MAP: Record<string, string> = {
  '체리레드': '#D80C1E', '체리 레드': '#D80C1E',
  '와인버건디': '#A22327', '와인 버건디': '#A22327',
  '스위트오렌지': '#EE780C', '스위트 오렌지': '#EE780C',
  '리빙코랄': '#FF6633', '리빙 코랄': '#FF6633',
  '씨트러스': '#FB6D21',
  '로즈핑크': '#E61A67', '로즈 핑크': '#E61A67',
  '블로썸핑크': '#FFD3C5', '블로썸 핑크': '#FFD3C5',
  '라벤더퍼플': '#E6C8CE', '라벤더 퍼플': '#E6C8CE',
  '브라이트옐로우': '#FFE100', '브라이트 옐로우': '#FFE100',
  '올리브그린': '#79A02F', '올리브 그린': '#79A02F',
  '프레시민트': '#CCEFC2', '프레시 민트': '#CCEFC2',
  '그래스': '#BED12B',
  '아보카도그린': '#C6D59B', '아보카도 그린': '#C6D59B',
  '아쿠아블루': '#0081CC', '아쿠아 블루': '#0081CC',
  '네이비블루': '#10376C', '네이비 블루': '#10376C', '네이비': '#10376C',
  '파스텔블루': '#D6E0EC', '파스텔 블루': '#D6E0EC',
  '스카이': '#2BB3E2', '스카이블루': '#2BB3E2',
  '오션': '#164690',
  '브라이트퍼플': '#754095', '브라이트 퍼플': '#754095',
  '딥퍼플': '#87234B', '딥 퍼플': '#87234B',
  '다크그레이': '#615F5F', '다크 그레이': '#615F5F',
  '라이트그레이': '#E5DED3', '라이트 그레이': '#E5DED3',
  '스톤': '#98ABB6',
  '오닉스': '#3A5657',
  '초코브라운': '#745334', '초코 브라운': '#745334',
  '레인보우': "url('https://yogibo.openhost.cafe24.com/web/img/promotion/show_room/icon/raindow_icon.png') center/cover",
  '뉴트럴': "url('https://yogibo.openhost.cafe24.com/web/img/promotion/show_room/icon/neutral_icon.png') center/cover",
  '마린': "url('https://yogibo.openhost.cafe24.com/web/img/promotion/show_room/icon/marine_icon.png') center/cover",
  '스노우': "url('https://yogibo.openhost.cafe24.com/web/img/event/pastel/icon/tab_03_06.png') center/cover",
  '블랙페어': "url('https://yogibo.openhost.cafe24.com/web/img/event/pastel/icon/tab_03_07.png') center/cover",
};

// 이미지 기반 컬러칩 — cafe24 의 /web/img/goods/color_chip/{이름}.png 사용.
// 솔리드 컬러 (#xxx) 가 아니라 이미지 자체를 chip 으로 표시 (스퀴지보·메이트·롤메이트 캐릭터 시리즈).
export const IMAGE_CHIP_BASE = 'https://yogibo.openhost.cafe24.com/web/img/goods/color_chip';
export const IMAGE_CHIP_NAMES: string[] = [
  // 스퀴지보 하트
  '스퀴지보_하트_브라이트 퍼플',
  '스퀴지보_하트_로즈핑크',
  '스퀴지보_하트_아쿠아블루',
  // 스퀴지보 애니멀
  '스퀴지보_애니멀_아울',
  '스퀴지보_애니멀_캣',
  '스퀴지보_애니멀_팍스',
  '스퀴지보_애니멀_도그',
  '스퀴지보_애니멀_코알라',
  '스퀴지보_애니멀_멍키',
  '스퀴지보_애니멀_티렉스',
  '스퀴지보_애니멀_유니콘',
  '스퀴지보_애니멀_옥토푸스',
  '스퀴지보_애니멀_우파루파',
  '스퀴지보_애니멀_나르왈',
  // 스퀴지보 플랜트
  '스퀴지보_플랜트_써니',
  '스퀴지보_플랜트_아로',
  '스퀴지보_플랜트_스프라우트',
  // 메이트 필로우
  '메이트_필로우_팍스',
  '메이트_필로우_지라프',
  '메이트_필로우_펭귄',
  '메이트_필로우_엘리펀트',
  // 메이트 (단일 캐릭터)
  '메이트_테디',
  '메이트_유니크',
  '메이트_오스왈드',
  '메이트_딜라일라',
  '메이트_버트랜드',
  '메이트_어니스트',
  '메이트_오파',
  '메이트_조젯',
  '메이트_디포',
  '메이트_모리슨',
  '메이트_데릭',
  '메이트_디오고',
  '메이트_케빈',
  '메이트_셸비',
  '메이트_펄',
  '메이트_지그프리트',
  '메이트_휴고',
  '메이트_로미',
  '메이트_다니엘',
  '메이트_야머스',
  '메이트_페스터스',
  '메이트_칼리스타',
  '메이트_코스모',
  '메이트_사울',
  '메이트_우파루파',
  '메이트_나르왈',
  // 메이트 플랜트
  '메이트_플랜트_써니',
  '메이트_플랜트_아로',
  '메이트_플랜트_스프라우트',
  // 롤메이트
  '롤메이트_도그',
  '롤메이트_팍스',
  '롤메이트_판다',
  '롤메이트_유니콘',
  '롤메이트_앨리게이터',
  '롤메이트_우파루파',
  // 하트필로우
  '하트필로우_체리레드',
  '하트필로우_로즈핑크',
];

function getColor(name: string): string {
  const norm = name.replace(/\s+/g, '');

  // 1) 이미지 기반 chip 우선 매칭 — cafe24 /web/img/goods/color_chip/{이름}.png
  const imgChipMatch = IMAGE_CHIP_NAMES.find(n => n.replace(/\s+/g, '') === norm);
  if (imgChipMatch) {
    // 한국어/공백 포함 파일명을 URL 안전하게 인코딩
    const encoded = encodeURIComponent(imgChipMatch);
    return `url('${IMAGE_CHIP_BASE}/${encoded}.png') center/cover`;
  }

  // 2) 기존 COLOR_MAP 정규화 정확 매칭
  const normKey = Object.keys(COLOR_MAP).find(k => k.replace(/\s+/g, '') === norm);
  if (normKey) return COLOR_MAP[normKey];

  // 3) 부분 매칭 폴백
  const partial = Object.keys(COLOR_MAP).find(
    k => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
  );
  return partial ? COLOR_MAP[partial] : '#CCCCCC';
}

function formatPrice(n: number) {
  return n.toLocaleString('ko-KR');
}

const FONT = 'Pretendard';
const TEXT_COLOR = '#474F57';
const STRIKE_COLOR = '#C2C2C2';
const THUMB_BG = 'rgb(245, 245, 245)';

function getSaleColor(rate: number): string {
  if (rate >= 20) return '#BE1D2C';
  if (rate >= 15) return '#E83817';
  if (rate >= 10) return '#E5006C';
  return '#E91E8C';
}

// 비즈 가격 줄 할인가 색 — 10% 도 15% 와 같은 색 (2026-10-21 디자인). 비즈 없는 상품은 getSaleColor 그대로.
function getBeadSaleColor(rate: number): string {
  return rate >= 10 && rate < 15 ? '#E83817' : getSaleColor(rate);
}

// width: 지정하면 프록시가 width×width 정사각으로 줄여서 보냄 (원본이 큰 원형 이미지)
function getProxyUrl(url: string, width?: number) {
  if (!url) return url;
  if (typeof window === 'undefined') return url;
  if (url.startsWith('http')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}${width ? `&w=${width}` : ''}`;
  }
  return url;
}

/*
 * ──── Figma 150dpi 기준 (frame 992 × 402) ─────────────────────────
 * 모든 위치/사이즈는 이 값을 기준으로 캔버스 height 에 맞춰 스케일링.
 *   sx = canvasWidth  / 992   (가로)
 *   sy = canvasHeight / 402   (세로 = 사각형 요소 / 폰트 스케일)
 * A타입(1984×803): sx=2.0, sy≈2.0  (Figma 그대로 2배)
 * B타입(1984×602): sx=2.0, sy=1.498
 */
const FIGMA = {
  W: 992, H: 402,
  // 썸네일
  thumbX: 30, thumbY: 31, thumbSize: 340,
  // 로고 (썸네일 좌하단 오버레이)
  logoX: 50, logoY: 321, logoW: 100, logoH: 40,
  // 타이틀
  titleX: 401, titleY: 71, titleSize: 46,
  // 서브타이틀
  subtitleX: 401, subtitleY: 124, subtitleSize: 27.3,
  // 설명
  descX: 401, descY: 175, descSize: 24.15, descLine: 29,
  // 컬러칩
  chipsX: 401, chipsY: 276, chipSize: 50, chipGap: 15.85,
  // 가격 (할인 시: 위 = 할인가, 아래 = 정상가 strikethrough)
  priceTopX: 810, priceTopY: 271, priceTopSize: 50.4,
  priceBottomY: 322,
  priceBottomLineX: 806, priceBottomLineY: 352, priceBottomLineW: 170,
  wonSize: 23.1, wonGapX: 8,
  // 가격 우측 anchor: 가격 텍스트 우측 끝(x=972)에서 Figma 우측(x=992)까지 거리 = 20
  priceRightFromCanvasRight: 20,
  // SALE 배지
  badgeX: 862, badgeY: 0, badgeW: 110, badgeH: 95,
  badgeSaleSize: 27.3, badgeNumSize: 39.9, badgePctSize: 25,
};

// A타입 전용 스펙 — 실제 렌더 픽셀(1984×803) 기준, Figma 스케일링 무시.
const A_TYPE_SPEC = {
  // 대표이미지 (썸네일): 640×640, 좌측 패딩 60, 세로 중앙 정렬
  thumbSize: 640,
  thumbX: 60,
  thumbY: 81, // (803 - 640) / 2
  thumbToTextGap: 62, // 썸네일 우측 → 타이틀 좌측 간격
  // 우측 텍스트 영역 y 시작 (썸네일과 독립)
  textY: 140,
  // 로고 (썸네일 좌하단 오버레이) — 썸네일 사이즈에 맞춰 비례
  logoW: 188,
  logoH: 75,
  logoLeftInThumb: 38,
  logoBottomInThumb: 19,
  // 상품명 (타이틀)
  titleSize: 70,
  titleLineHeight: 70, // 100%
  titleLetterSpacing: 'normal', // 0%
  titleWeight: 800,
  titleColor: '#474F57',
  // 서브타이틀
  subtitleSize: 48,
  subtitleLineHeight: 48, // 100%
  subtitleLetterSpacing: '-0.03em', // -3%
  subtitleWeight: 700,
  subtitleColor: '#474F57',
  subtitleMarginTop: 5, // 타이틀과의 간격

  // 상품설명
  descSize: 48,
  descLineHeight: 58,
  descLetterSpacing: '-0.03em', // -3%
  descWeight: 600,
  descColor: '#474F57',
  descMarginTop: 37, // 서브타이틀 없을 때
  descMarginTopWithSubtitle: 37, // 서브타이틀 있을 때
  // 가격 — 우측 하단, 칩과 같은 y 라인 (레퍼런스 이미지 기준 복원)
  priceColor: '#474F57',
  priceWeight: 700,
  priceFontSize: 100.8, // Figma 50.4 × 2
  wonFontSize: 32, // ₩ 기호 — 숫자 상단에 작게 배치
  priceRight: 40,
  priceTopY: 542, // Figma 271 × 2 (할인 시 sale price, 정상가 단일 시도 동일)
  priceBottomY: 644, // Figma 322 × 2 (할인 시 정상가 취소선)
  // 컬러칩: 95px, gap 20px, 컨테이너 806px → 한 줄 최대 7개 (wrap)
  // 텍스트 column flex 안에 위치 → 상품설명으로부터 margin-top 85px
  chipSize: 95,
  chipGap: 20,
  chipsContainerWidth: 806,
  chipsMarginTop: 85,
  // 15개 이상일 때 — 칩 80px 로 축소하고 컨테이너를 750px 로 잡아 wrap (한 줄 8개)
  chipsLargeThreshold: 15,
  chipSizeLarge: 80,
  chipGapLarge: 15,
  chipsContainerWidthLarge: 750,
  // 20개 이상일 때 — margin-top 만 60px 로 축소 (행 수가 많아 위 여백 줄임)
  chipsExtraLargeThreshold: 20,
  chipsMarginTopExtraLarge: 60,
  // 컬러칩이 가격 앞까지 한 줄에 다 들어가면 120px 큰 칩 — B타입과 같은 규칙 (스퀴지보 제외).
  // 위끝 y 573 = 썸네일 아래끝(721)에서 148 위 (B타입: 썸네일 아래끝 551 − 칩 위끝 403 = 148)
  chipSizeBig: 120,
  chipGapBig: 24,
  chipsTopBig: 573,
  chipsMinGapBig: 30,
  chipsToPrice: 40, // 한 줄 판단 시 칩 끝 ~ 가격 최소 간격
  // SALE 배지 — 우측 상단 (원래 Figma 위치 복원)
  badgeRight: 40,
  badgeTop: 0,
  badgeW: 220,
  badgeH: 190,
  badgeSaleSize: 54.6,
  badgeNumSize: 79.8,
  badgePctSize: 50,
  // 텍스트 영역 maxWidth — 서브타이틀·상품설명 줄바꿈 폭 (배지 좌측 1724 침범 안 함: 762+940=1702)
  textMaxWidth: 940,
};

// B타입 전용 스펙 — 실제 렌더 픽셀(1984×602) 기준.
const B_TYPE_SPEC = {
  // 대표이미지 (썸네일): 500×500, 좌측 패딩 60, 세로 중앙 정렬
  thumbSize: 500,
  thumbX: 60,
  thumbY: 51, // (602 - 500) / 2
  thumbToTextGap: 140, // 썸네일 우측 → 타이틀 좌측 간격 (비즈 없는 상품 — 기존)
  // 비즈 상품 (2026-10-21 디자인): 타이틀 x 630, 상품명 박스 1010 × 70 (오른쪽 여백 344)
  beadThumbToTextGap: 70,
  beadTextMaxWidth: 1010,
  // 썸네일 오른쪽 위 원형 이미지 (리필 비즈 시안 디자인 수치) — 테두리는 안쪽 정렬이라 바깥 지름 = size
  circleLeft: 368,
  circleTop: 31,
  circleSize: 225,
  circleBorder: 8,
  // 로고 (썸네일 좌하단 오버레이) — 썸네일 사이즈에 맞춰 비례
  logoW: 150,
  logoH: 60,
  logoLeftInThumb: 30,
  logoBottomInThumb: 15,
  // 우측 텍스트 영역 y 시작 (상품명 margin-top 105px)
  textY: 105,
  textMaxWidth: 900,
  // 상품명
  titleSize: 70,
  titleLineHeight: 70, // 100%
  titleLetterSpacing: 'normal', // 0%
  titleWeight: 800,
  titleColor: '#474F57',
  // 서브타이틀
  subtitleSize: 48,
  subtitleLineHeight: 48, // 100%
  subtitleLetterSpacing: '-0.03em', // -3%
  subtitleWeight: 700,
  subtitleColor: '#474F57',
  subtitleMarginTop: 5, // 상품명과의 간격
  // 상품설명
  descSize: 38,
  descLineHeight: 46, // line-height 명시 없음 → 약 120%
  descLetterSpacing: '-0.03em', // -3%
  descWeight: 700,
  descColor: '#474F57',
  descMarginTop: 37, // 서브타이틀 없을 때
  descMarginTopWithSubtitle: 30, // 서브타이틀 있을 때
  // 가격 — 우측 하단, ₩ 는 숫자 상단 정렬 (wonAlignTop)
  priceColor: '#474F57',
  priceWeight: 700,
  priceFontSize: 80,
  wonFontSize: 26,
  priceRight: 40,
  priceTopY: 415,
  priceBottomY: 495, // 정상가 취소선 (할인 시)
  // 컬러칩: 80px × 7개 기본 (상품명별 분기는 PriceCardB 안에서) — 텍스트 흐름 안에 배치
  chipSize: 80,
  chipGap: 15,
  chipsContainerWidth: 650,
  chipsMarginTop: 60, // 텍스트(설명/서브타이틀) 끝에서 떨어지는 간격
  // 컬러칩이 가격 앞까지 한 줄에 다 들어가면 120px 큰 칩 (스퀴지보 제외). 간격·위치는 디자인 캡처 측정값:
  // 칩 위끝은 설명 줄 수와 관계없이 y ≈ 403 (설명이 길어 넘어오면 설명 끝에서 chipsMinGapBig 만큼)
  chipSizeBig: 120,
  chipGapBig: 24,
  chipsTopBig: 403,
  chipsMinGapBig: 30,
  chipsToPrice: 40, // 한 줄 판단 시 칩 끝 ~ 가격 최소 간격
  // 여러 줄 칩이 썸네일 아래끝(551)보다 내려가면 칩·간격을 같은 비율로 줄여 한 줄에 더 넣음 (15색 이상에서 넘침)
  chipSizeMin: 40,
  // SALE 배지 — 우측 상단
  badgeRight: 40,
  badgeTop: 0,
  badgeW: 180,
  badgeH: 156,
  badgeSaleSize: 45,
  badgeNumSize: 66,
  badgePctSize: 41,
};

// B타입 비즈별 가격 줄 (S / P / P+) — 실제 렌더 픽셀(1984×602) 기준, 2026-10-21 디자인 수치.
// 가격 영역 오른쪽 끝 = 1984 - B_TYPE_SPEC.priceRight(40) = 1944.
// 왼쪽 끝(구분선·아이콘 시작) = 할인 있음 1320 (구분선 폭 624) / 정상가만 1523 (폭 421).
// 가격이 길어 그 폭을 넘으면 왼쪽으로 늘어남.
// 간격 값은 원본 시안 캡처에서 측정 — 주석의 '보이는 간격' 은 글자 좌우 여백을 뺀 실제 잉크 사이 거리.
const B_BEAD_SPEC = {
  rows: 3, // 이 수치가 기준으로 삼는 줄 수 (비즈 2개 이하는 B_BEAD2_SPEC)
  stacked: false, // true 면 할인가 아래에 취소선 정상가를 쌓음 (saleTop / strikeTop 사용)
  saleTop: 0,
  strikeTop: 0,
  firstLineY: 272, // 3줄일 때 첫 구분선 y. 줄이 적으면 아래쪽(마지막 줄 위치)에 맞춰 붙임
  rowPitch: 105, // 구분선 → 다음 구분선 (아이콘 top 289.5 / 394.5 / 499)
  lineWidth: 1,
  lineColor: '#515A63',
  minWidthSale: 624,
  minWidthRegular: 421,
  rowBoxHeight: 80, // 줄 안 가격 박스 높이 (= 할인가·정상가만 line-height)
  lineToPrice: 10, // 구분선 top → 가격 박스 top. 아이콘은 박스 세로 중앙 → 구분선 + 17.5
  // 비즈 아이콘 (원)
  badgeSize: 65,
  badgeFontSize: 50,
  badgeFontWeight: 600,
  badgePlusSize: 30, // P+ 의 '+' — 원 안에 들어가도록 축소 (수치 미정)
  // S · P 는 디자인 수치, P+ 는 시안 이미지에서 추출한 색
  badgeColors: { S: '#00BDD4', P: '#5B33AF', 'P+': '#C8A24A' } as Record<BeadType, string>,
  // 비즈가 아닌 수치 옵션(리필 비즈 0.4kg 등)은 아이콘 자리에 숫자 + 단위 글자 (Bold, 아이콘 칸 가운데).
  // 리필 비즈 시안 캡처 측정값 (±4px)
  optionNumberSize: 56,
  optionUnitSize: 33,
  optionUnitGap: 2,
  optionColor: '#00BDD4',
  // 아이콘 → ₩ 최소 간격 (가장 긴 줄에서 보이는 간격 약 12). 보통은 최소 폭(624 / 421) 안에서
  // 남는 만큼 벌어지고, 가격이 길어 이 간격도 안 남을 때만 가격 영역이 왼쪽으로 늘어남
  badgeToPrice: 11,
  strikeToSale: 11, // 취소선 정상가 → 할인가 ₩ (보이는 간격 약 10)
  // 가격 3종 — 숫자 Pretendard 700 (열마다 오른쪽 정렬), ₩ Pretendard 400, letterSpacing 은 em.
  // wonGap: ₩ → 숫자, wonTop: 가격 박스 위 → ₩ (원본 시안처럼 ₩ 윗선을 숫자 윗선 근처에 맞춤)
  // tabular: 고정폭 숫자 — 원본 시안의 80px 가격은 줄마다 ₩ 위치와 끝이 같아 고정폭으로 그림
  regular: { fontSize: 80, lineHeight: 80, letterSpacing: -0.02, wonSize: 19.5, wonGap: 7, wonTop: 8, tabular: true }, // 정상가만 (₩→숫자 보이는 간격 약 12)
  strike: { fontSize: 50, lineHeight: 60, letterSpacing: -0.04, wonSize: 19.5, wonGap: 2, wonTop: 4, tabular: false }, // 할인 시 정상가, line-height 60 → 할인가와 baseline 맞음 (약 4)
  sale: { fontSize: 80, lineHeight: 80, letterSpacing: -0.01, wonSize: 26, wonGap: 9, wonTop: 9, tabular: true }, // 할인가 (약 14)
  // 취소선 — text-decoration 은 원본보다 낮게 그려져 직접 그림. 위치는 글자 박스 위에서 em
  strikeLineCenter: 0.45,
  strikeLineThickness: 4,
  // 상품설명·컬러칩이 가격 영역에 닿지 않도록 두는 최소 간격
  textToPrice: 40,
};
type BeadSpec = typeof B_BEAD_SPEC;
type BeadPriceStyle = BeadSpec['regular'];

// B타입 비즈 2개 (예: S·P) — 2026-10-21 디자인 (롤 메이트 시안). 줄 간격을 넓히고, 할인 시 할인가 아래에 취소선 정상가를 쌓음.
// 디자인 수치: 가격 80/80 · 취소선 50/60 모두 자간 -4%, 가격 박스 사이 78, 아이콘 → 가격 30.
// 시안 캡처 측정값(±4px): 첫 구분선 267, 할인가 박스 위 = 구분선 + 3 (숫자 윗선이 아이콘 윗선과 맞음), 취소선 박스 위 = 구분선 + 76.
const B_BEAD2_SPEC: BeadSpec = {
  ...B_BEAD_SPEC,
  rows: 2,
  stacked: true,
  saleTop: 3,
  strikeTop: 76,
  firstLineY: 267,
  rowPitch: 158, // 가격 박스 80 + 박스 사이 78
  minWidthSale: 0, // 폭은 내용에 맞춤 (아이콘 + 30 + 가장 긴 가격)
  minWidthRegular: 0,
  badgeToPrice: 30,
  regular: { ...B_BEAD_SPEC.regular, letterSpacing: -0.04, tabular: false },
  strike: { ...B_BEAD_SPEC.strike, letterSpacing: -0.04 },
  sale: { ...B_BEAD_SPEC.sale, letterSpacing: -0.04, tabular: false },
};

// 비즈 개수에 맞는 수치 — 2개 이하면 2줄 디자인
function pickBeadSpec(beadPrices: BeadPrice[], three: BeadSpec, two: BeadSpec): BeadSpec {
  return beadPrices.length <= two.rows ? two : three;
}

// 비즈 가격 줄 수치를 s 배로 키우고 첫 구분선 y 를 firstLineY 로
function scaleBeadSpec(spec: BeadSpec, s: number, firstLineY: number): BeadSpec {
  const style = (st: BeadPriceStyle): BeadPriceStyle => ({
    ...st,
    fontSize: st.fontSize * s, lineHeight: st.lineHeight * s,
    wonSize: st.wonSize * s, wonGap: st.wonGap * s, wonTop: st.wonTop * s,
  });
  return {
    ...spec,
    firstLineY,
    saleTop: spec.saleTop * s,
    strikeTop: spec.strikeTop * s,
    rowPitch: spec.rowPitch * s,
    lineToPrice: spec.lineToPrice * s,
    rowBoxHeight: spec.rowBoxHeight * s,
    lineWidth: Math.max(1, Math.round(spec.lineWidth * s)),
    minWidthSale: spec.minWidthSale * s,
    minWidthRegular: spec.minWidthRegular * s,
    badgeSize: spec.badgeSize * s,
    badgeFontSize: spec.badgeFontSize * s,
    badgePlusSize: spec.badgePlusSize * s,
    optionNumberSize: spec.optionNumberSize * s,
    optionUnitSize: spec.optionUnitSize * s,
    optionUnitGap: spec.optionUnitGap * s,
    badgeToPrice: spec.badgeToPrice * s,
    strikeToSale: spec.strikeToSale * s,
    regular: style(spec.regular), strike: style(spec.strike), sale: style(spec.sale),
    strikeLineThickness: spec.strikeLineThickness * s,
    textToPrice: spec.textToPrice * s,
  };
}

// A타입 비즈 가격 줄 — A타입 전용 디자인 수치 나오기 전까지 B타입 값을 A_BEAD_SCALE 배로 사용.
// 1.26(기존 A/B 가격 글자 비율)은 가격이 상품명보다 너무 커서 1.0 — A타입 상품명·서브타이틀도 B타입과 같은 px.
// 세로 위치: 3줄일 때 마지막 줄 가격 박스 아래끝을 기존 A타입 가격 아래끝(priceBottomY + priceFontSize ≈ 745)에 맞춤
// (B타입도 마지막 줄 아래끝 572 ≈ 기존 B타입 가격 아래끝 575). 2줄은 B타입처럼 3줄 첫 구분선 기준으로 같은 비율만큼 옮김.
const A_BEAD_SCALE = 1;
const A_BEAD_FIRST_LINE_Y = A_TYPE_SPEC.priceBottomY + A_TYPE_SPEC.priceFontSize
  - A_BEAD_SCALE * (B_BEAD_SPEC.rowBoxHeight + B_BEAD_SPEC.lineToPrice + (B_BEAD_SPEC.rows - 1) * B_BEAD_SPEC.rowPitch);
const A_BEAD_SPEC = scaleBeadSpec(B_BEAD_SPEC, A_BEAD_SCALE, A_BEAD_FIRST_LINE_Y);
const A_BEAD2_SPEC = scaleBeadSpec(
  B_BEAD2_SPEC,
  A_BEAD_SCALE,
  A_BEAD_FIRST_LINE_Y + A_BEAD_SCALE * (B_BEAD2_SPEC.firstLineY - B_BEAD_SPEC.firstLineY),
);
// A타입 비즈 없는 상품의 취소선 정상가 — 기존 A타입 가격이 B타입의 1.26배(100.8 / 80)라 같은 비율로 (63px)
const A_PLAIN_STRIKE_SPEC = scaleBeadSpec(B_BEAD2_SPEC, A_TYPE_SPEC.priceFontSize / B_TYPE_SPEC.priceFontSize, 0);

// ─── 썸네일 오른쪽 위 원형 이미지 (리필 비즈) ─────────────────
// 컬러칩 이미지처럼 상품명으로 찾음 (lib/circleImages). B타입 디자인 수치를 썸네일 기준 비율로 옮겨 A타입에도 같은 자리에 그림.
function CircleImage({ product, thumbX, thumbY, thumbSize }: {
  product: ProductData; thumbX: number; thumbY: number; thumbSize: number;
}) {
  const circle = getCircleImage(product.name);
  if (!circle) return null;
  const B = B_TYPE_SPEC;
  const s = thumbSize / B.thumbSize;
  const size = B.circleSize * s;
  const inner = size - B.circleBorder * s * 2;
  const src = product._base64Circle || getProxyUrl(imgUrl(circle.image), CIRCLE_IMAGE_PX);
  return (
    <div style={{
      position: 'absolute',
      left: thumbX + (B.circleLeft - B.thumbX) * s,
      top: thumbY + (B.circleTop - B.thumbY) * s,
      width: size, height: size, borderRadius: `${size / 2}px`,
      backgroundColor: circle.border,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt=""
        style={{ width: inner, height: inner, borderRadius: `${inner / 2}px`, objectFit: 'cover' }} />
    </div>
  );
}

// ─── 썸네일 블록 ────────────────────────────────────────────
function ThumbnailBlock({
  product, left, top, size, logoLeft, logoBottom, logoW, logoH,
}: {
  product: ProductData; left: number; top: number; size: number;
  logoLeft: number; logoBottom: number; logoW: number; logoH: number;
}) {
  const thumbUrl = product._base64Thumb || getProxyUrl(imgUrl(product.thumbnailImage));
  // 다운로드는 서버가 고른 로고(_base64Logo), 미리보기는 logoWhite(로고 자리가 어두우면 흰 로고)
  const logoUrl = product._base64Logo || getProxyUrl(product.logoWhite ? LOGO_WHITE_URL : LOGO_URL);
  // Figma "자산 2 1" 마스크: top-right 코너만 큰 라운드 (비대칭 cushion 형태).
  const radius = Math.round(size * 0.5);
  return (
    <div style={{
      position: 'absolute', left, top, width: size, height: size,
      display: 'flex', background: THUMB_BG, overflow: 'hidden',
      // satori 는 개별 border*Radius + 절대위치 자식 조합에서 클립이 안 됨.
      // shorthand 로 작성해야 안정적으로 클리핑이 적용됨.
      borderRadius: `0px ${radius}px 0px 0px`,
    }}>
      {thumbUrl && (
        // 메인 썸네일 — flex child 로 두고 border-radius 를 자체에도 동일하게 적용해서
        // satori 폴백 케이스에서도 visual 동일하게 보이도록 보강.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbUrl} alt={product.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            borderRadius: `0px ${radius}px 0px 0px`,
          }} />
      )}
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="yogibo"
          style={{
            position: 'absolute', left: logoLeft, bottom: logoBottom,
            width: logoW, height: logoH, objectFit: 'contain',
          }} />
      )}
    </div>
  );
}

// ─── 컬러칩 ─────────────────────────────────────────────
function ColorChips({
  colors, left, top, chipSize, gap, base64ColorChips, maxWidth, wrap, fixedSize, relative, marginTop,
}: {
  colors: string[]; chipSize: number; gap: number;
  // 절대 위치 모드 (기본): left/top 필요
  left?: number; top?: number;
  base64ColorChips?: (string | null)[];
  maxWidth?: number;
  // wrap: true면 maxWidth 를 넘으면 줄바꿈 (chipSize 유지)
  // fixedSize: true면 chipSize 자동 축소 비활성 (wrap 과 함께 사용)
  wrap?: boolean;
  fixedSize?: boolean;
  // relative: true면 absolute 가 아닌 flow 안에 자리잡음 (부모 column flex 자식으로)
  relative?: boolean;
  marginTop?: number;
}) {
  if (!colors || colors.length === 0) return null;

  // 컬러 개수가 많아서 maxWidth 를 넘으면 칩 사이즈/간격을 비례 축소.
  // gap : chipSize 비율은 시안 그대로 유지.
  const gapRatio = chipSize > 0 ? gap / chipSize : 0.317;
  const requiredWidth = colors.length * chipSize + Math.max(0, colors.length - 1) * gap;
  let actualChipSize = chipSize;
  let actualGap = gap;
  if (!fixedSize && maxWidth && requiredWidth > maxWidth) {
    actualChipSize = maxWidth / (colors.length + Math.max(0, colors.length - 1) * gapRatio);
    actualGap = actualChipSize * gapRatio;
  }

  return (
    <div style={{
      // relative=true: 부모 flex column 안에 자리잡음 (margin-top 으로 위 요소와 간격)
      // relative=false(기본): absolute 위치 (left/top 사용)
      // satori 가 undefined CSS 값을 trim() 시도하다 깨질 수 있어 조건부 spread 로 키 자체 제외
      position: relative ? 'relative' : 'absolute',
      ...(relative
        ? (marginTop !== undefined ? { marginTop } : {})
        : { left: left ?? 0, top: top ?? 0 }),
      display: 'flex', flexDirection: 'row', alignItems: 'center',
      columnGap: actualGap,
      rowGap: actualGap,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      ...(wrap && maxWidth ? { width: maxWidth } : {}),
    }}>
      {colors.map((color, i) => {
        const colorVal = getColor(color);
        const isImg = colorVal.includes('url(');
        let bgImgUrl = '';
        if (isImg) {
          bgImgUrl = (base64ColorChips && base64ColorChips[i]) || '';
          if (!bgImgUrl) {
            const match = colorVal.match(/url\(['"]?(.*?)['"]?\)/);
            bgImgUrl = match ? match[1] : '';
          }
        }
        // satori 클리핑 안정성: shorthand 'px' 문자열 + img 자체에도 동일 radius 적용
        const radiusStr = `${actualChipSize / 2}px`;
        return (
          <div key={`${color}-${i}`} style={{
            width: actualChipSize, height: actualChipSize,
            borderRadius: radiusStr,
            display: 'flex', overflow: 'hidden',
            backgroundColor: isImg ? 'rgb(245, 245, 245)' : colorVal,
            flexShrink: 0, flexGrow: 0,
          }}>
            {isImg && bgImgUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bgImgUrl}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  borderRadius: radiusStr,
                }} alt={color} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── 가격 한 줄 (₩ + 숫자, 오른쪽 정렬) ──────────────────────
// wonAlignTop=false(기본): ₩ 를 숫자 baseline 약간 아래로 정렬 (B타입/커스텀 기존 동작)
// wonAlignTop=true:        ₩ 를 숫자 상단(cap-height)에 맞춰 정렬 (A타입)
function PriceLine({
  amount, color, fontSize, wonSize, right, top, strike, wonAlignTop, canvasW,
}: {
  amount: number; color: string; fontSize: number; wonSize: number;
  right: number; top: number; strike?: boolean; wonAlignTop?: boolean;
  // 캔버스(프레임) 전체 폭. satori 에서 right 앵커가 깨지므로 left 로 환산하기 위해 필요.
  canvasW: number;
}) {
  // satori(next/og)는 position:absolute + right 앵커 요소를 PNG export 에서 렌더하지
  // 않는다(브라우저 미리보기는 정상). left 앵커는 정상 동작하므로,
  // 콘텐츠 폭을 추정해 left = 캔버스폭 - right - 폭 으로 환산한다.
  const boxWidth = Math.ceil(estimatePriceWidth(amount, fontSize, wonSize)) + Math.round(fontSize * 0.1);
  const left = Math.round(canvasW - right - boxWidth);
  return (
    <div style={{
      position: 'absolute', left, top, width: boxWidth,
      display: 'flex', flexDirection: 'row', justifyContent: 'flex-end',
      alignItems: wonAlignTop ? 'flex-start' : 'flex-end',
    }}>
      <span style={{
        fontFamily: FONT,
        // wonAlignTop=true (A타입): 굵기 400 (가볍게), top 정렬
        // wonAlignTop=false (B/커스텀): 굵기 700, baseline 정렬
        fontWeight: wonAlignTop ? 400 : 700,
        fontSize: wonSize, color,
        display: 'flex', flexShrink: 0, marginRight: Math.round(fontSize * 0.12),
        // baseline 정렬 시: 숫자 아래로 살짝 (Figma y 오프셋 유사)
        // top 정렬 시: 숫자 cap-top 과 ₩ cap-top 을 맞추기 위해 살짝 아래로
        paddingBottom: wonAlignTop ? 0 : Math.round(fontSize * 0.04),
        paddingTop: wonAlignTop ? Math.round(fontSize * 0.05) : 0,
      }}>₩</span>
      <span style={{
        fontFamily: FONT, fontWeight: 700, fontSize, color,
        letterSpacing: `-${Math.round(fontSize * 0.05)}px`,
        textDecoration: strike ? 'line-through' : 'none',
        display: 'flex', flexShrink: 0, lineHeight: 1,
      }}>{formatPrice(amount)}</span>
    </div>
  );
}

// ─── SALE 배지 (이미지 우선, CSS 폴백) ──────────────────────
function SaleBadge({
  rate, product, right, top, w, h, saleSize, numSize, pctSize,
}: {
  rate: number; product: ProductData;
  right: number; top: number; w: number; h: number;
  saleSize: number; numSize: number; pctSize: number;
}) {
  if (!rate) return null;
  const supported = [10, 15, 20];
  const exact = supported.find((r) => r === rate);
  const badgeUrl = product._base64Badge || (exact
    ? getProxyUrl(`http://yogibo.openhost.cafe24.com/web/vmd/${exact}.png`)
    : null);

  if (badgeUrl) {
    return (
      <div style={{ position: 'absolute', right, top, width: w, height: h, display: 'flex' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt={`SALE ${rate}%`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    );
  }

  // CSS 폴백 — 핑크 banner with V-notch
  return (
    <div style={{
      position: 'absolute', right, top, width: w, height: h,
      backgroundColor: getSaleColor(rate),
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      paddingTop: Math.round(h * 0.04),
      // V-notch at bottom — satori 가 clip-path polygon 지원함
      clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)',
    }}>
      <span style={{
        fontFamily: FONT, fontWeight: 700, fontSize: saleSize, color: 'white',
        display: 'flex', lineHeight: 1, marginBottom: Math.round(h * 0.05),
      }}>SALE</span>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: FONT, fontWeight: 800, fontSize: numSize, color: 'white',
          display: 'flex', lineHeight: 1,
        }}>{rate}</span>
        <span style={{
          fontFamily: FONT, fontWeight: 800, fontSize: pctSize, color: 'white',
          display: 'flex', lineHeight: 1,
          marginLeft: Math.round(numSize * 0.05),
          marginTop: Math.round(numSize * 0.1),
        }}>%</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PriceCard — Figma 992×402 디자인을 (width, height) 캔버스에 비례 배치
// ═══════════════════════════════════════════════════════════════
// 가격 텍스트의 픽셀 너비 추정 — Pretendard Bold 기준 평균 문자폭으로 근사.
// 자동 맞춤 시 컬러칩 maxWidth 계산에 사용.
function estimatePriceWidth(amount: number, priceFontSize: number, wonFontSize: number): number {
  const text = amount.toLocaleString('ko-KR');
  // Pretendard Bold: 숫자 ≈ 0.55em, 쉼표 ≈ 0.30em
  let textWidth = 0;
  for (const ch of text) {
    textWidth += (ch === ',' ? 0.30 : 0.55) * priceFontSize;
  }
  // ₩ 기호 폭 + 우측 마진
  const wonWidth = wonFontSize * 0.85 + priceFontSize * 0.12;
  return textWidth + wonWidth;
}

export function PriceCard({ product, width, height, autoFit }: {
  product: ProductData; width: number; height: number;
  /**
   * autoFit:
   *  - false(기본): A/B타입 모드. sx=width/992 (가로), sy=height/402 (세로), 비균등 스케일.
   *                              캔버스 가로폭을 꽉 채움. A타입은 세로 압축, B타입은 균등 2배.
   *  - true:        커스텀 모드. 균등 스케일 = min(sx, sy). Figma 비율 그대로 보존하며 캔버스에 맞춰 비례 축소,
   *                              남는 공간은 상·하·좌·우 여백으로 중앙 정렬. 어떤 사이즈에서도 디자인 비율 유지.
   */
  autoFit?: boolean;
}) {
  let sx: number, sy: number, sf: number;
  let originX = 0, originY = 0;

  if (autoFit) {
    const s = Math.min(width / FIGMA.W, height / FIGMA.H);
    sx = sy = sf = s;
    originX = (width - FIGMA.W * s) / 2;
    originY = (height - FIGMA.H * s) / 2;
  } else {
    sx = width / FIGMA.W;
    sy = height / FIGMA.H;
    sf = sy;
  }

  const hasSale = product.discountRate > 0 && product.salePrice > 0 && product.salePrice !== product.originalPrice;
  const showDesc = product.description && product.description !== '없음';
  const showColors = product.colors?.length > 0
    && !product.colors.includes('없음')
    && !product.colors.includes('이미지');

  // Figma 좌표 → 캔버스 좌표 변환 헬퍼
  const posX = (figX: number) => originX + figX * sx;
  const posY = (figY: number) => originY + figY * sy;

  // 썸네일 + 로고 위치 계산 (썸네일 박스 좌표계 안에서 로고 위치)
  const thumbSize = FIGMA.thumbSize * sy;
  const thumbLeft = posX(FIGMA.thumbX);
  const thumbTop = posY(FIGMA.thumbY);
  // Figma 로고 절대좌표 → 썸네일 박스 상대좌표
  const logoLeftAbs = posX(FIGMA.logoX);
  const logoTopAbs = posY(FIGMA.logoY);
  const logoW = FIGMA.logoW * sf;
  const logoH = FIGMA.logoH * sf;
  const logoLeftInThumb = logoLeftAbs - thumbLeft;
  const logoBottomInThumb = thumbTop + thumbSize - (logoTopAbs + logoH);

  // 가격 우측 anchor (캔버스 우측에서 가격 텍스트 우측 끝까지의 거리)
  // autoFit 시 originX 만큼 오른쪽으로 더 들여서 중앙 정렬 유지
  const priceRight = originX + FIGMA.priceRightFromCanvasRight * sx;

  return (
    <div style={{
      position: 'relative', width, height,
      backgroundColor: 'white', display: 'flex',
      fontFamily: FONT, overflow: 'hidden',
    }}>
      {/* 썸네일 */}
      <ThumbnailBlock
        product={product}
        left={thumbLeft} top={thumbTop} size={thumbSize}
        logoLeft={logoLeftInThumb} logoBottom={logoBottomInThumb}
        logoW={logoW} logoH={logoH}
      />

      {/* 타이틀 */}
      <div style={{
        position: 'absolute', left: posX(FIGMA.titleX), top: posY(FIGMA.titleY),
        fontFamily: FONT, fontWeight: 800, fontSize: FIGMA.titleSize * sf,
        color: TEXT_COLOR, lineHeight: 1.1,
        display: 'flex', flexDirection: 'column',
      }}>
        {product.name?.split('\n').map((line, i) => (
          <span key={i} style={{ display: 'flex' }}>{line}</span>
        ))}
      </div>

      {/* 서브타이틀 */}
      {product.subtitle && (
        <div style={{
          position: 'absolute', left: posX(FIGMA.subtitleX), top: posY(FIGMA.subtitleY),
          fontFamily: FONT, fontWeight: 700, fontSize: FIGMA.subtitleSize * sf,
          color: TEXT_COLOR, lineHeight: 1.2,
          letterSpacing: `-${(FIGMA.subtitleSize * sf * 0.03).toFixed(2)}px`,
          display: 'flex', flexDirection: 'column',
        }}>
          {product.subtitle?.split('\n').map((line, i) => (
            <span key={i} style={{ display: 'flex' }}>{line}</span>
          ))}
        </div>
      )}

      {/* 설명 (2줄까지) */}
      {showDesc && (
        <div style={{
          position: 'absolute', left: posX(FIGMA.descX), top: posY(FIGMA.descY),
          fontFamily: FONT, fontWeight: 600, fontSize: FIGMA.descSize * sf,
          color: TEXT_COLOR, lineHeight: `${FIGMA.descLine * sf}px`,
          letterSpacing: `-${(FIGMA.descSize * sf * 0.03).toFixed(2)}px`,
          display: 'flex', flexDirection: 'column',
          maxWidth: (FIGMA.W - FIGMA.descX - 30) * sx,
        }}>
          {product.description?.split('\n').map((line, i) => (
            <span key={i} style={{ display: 'flex' }}>{line}</span>
          ))}
        </div>
      )}

      {/* 컬러칩 — 가격 텍스트 실제 너비를 고려해 maxWidth 동적 산정 */}
      {showColors && (() => {
        const priceFontSize = FIGMA.priceTopSize * sf;
        const wonFontSize = FIGMA.wonSize * sf;
        // 정상가/할인가 중 더 긴 텍스트 기준 (취소선 가격이 더 길 수 있음)
        const refAmount = Math.max(product.originalPrice || 0, product.salePrice || 0);
        const priceTextWidth = estimatePriceWidth(refAmount, priceFontSize, wonFontSize);
        const priceLeftEdge = width - priceRight - priceTextWidth;
        const chipsLeft = posX(FIGMA.chipsX);
        const buffer = 20 * sx;
        const dynamicMax = Math.max(50, priceLeftEdge - chipsLeft - buffer);
        return (
          <ColorChips
            colors={product.colors}
            left={chipsLeft} top={posY(FIGMA.chipsY)}
            chipSize={FIGMA.chipSize * sf} gap={FIGMA.chipGap * sx}
            base64ColorChips={product._base64ColorChips}
            maxWidth={dynamicMax}
          />
        );
      })()}

      {/* 가격 */}
      {hasSale ? (
        <>
          <PriceLine
            amount={product.salePrice}
            color={getSaleColor(product.discountRate)}
            fontSize={FIGMA.priceTopSize * sf}
            wonSize={FIGMA.wonSize * sf}
            right={priceRight} canvasW={width} top={posY(FIGMA.priceTopY)}
          />
          <PriceLine
            amount={product.originalPrice}
            color={STRIKE_COLOR}
            fontSize={FIGMA.priceTopSize * sf}
            wonSize={FIGMA.wonSize * sf}
            right={priceRight} canvasW={width} top={posY(FIGMA.priceBottomY)}
            strike
          />
        </>
      ) : (
        <PriceLine
          amount={product.originalPrice}
          color={TEXT_COLOR}
          fontSize={FIGMA.priceTopSize * sf}
          wonSize={FIGMA.wonSize * sf}
          right={priceRight} canvasW={width} top={posY(FIGMA.priceTopY)}
        />
      )}

      {/* SALE 배지 — autoFit 시 originX/originY 만큼 안쪽으로 들여서 중앙 정렬 유지 */}
      {hasSale && (
        <SaleBadge
          rate={product.discountRate} product={product}
          right={originX + (FIGMA.W - FIGMA.badgeX - FIGMA.badgeW) * sx}
          top={posY(FIGMA.badgeY)}
          w={FIGMA.badgeW * sf} h={FIGMA.badgeH * sf}
          saleSize={FIGMA.badgeSaleSize * sf}
          numSize={FIGMA.badgeNumSize * sf}
          pctSize={FIGMA.badgePctSize * sf}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// A타입: 1984 × 803 — 절대 픽셀 기반 신규 디자인
// 좌측 썸네일 640×640, 우측 텍스트 영역(타이틀/서브타이틀/상품설명),
// 우측 하단에 가격, 그 좌측에 컬러칩(같은 y 라인).
// 칩이 2행 이상이면 y가 491로 올라감 (가격 위로).
// ═══════════════════════════════════════════════════════════
function PriceCardA({ product }: { product: ProductData }) {
  const W = 1984, H = 803;
  const A = A_TYPE_SPEC;

  // 비즈별 가격이 있으면 S / P / P+ 가격 줄 (B타입 디자인 1.26배), 없으면 기존 가격 1개
  const beadPrices = product.beadPrices && product.beadPrices.length > 0 ? product.beadPrices : null;
  const hasSale = beadPrices ? beadPrices.some(hasSalePrice) : hasSalePrice(product);
  const showDesc = product.description && product.description !== '없음';
  const showColors = product.colors?.length > 0
    && !product.colors.includes('없음')
    && !product.colors.includes('이미지');
  const hasSubtitle = !!product.subtitle;

  // 텍스트 영역 시작 좌표
  const textX = A.thumbX + A.thumbSize + A.thumbToTextGap;
  const textY = A.textY;

  // 컬러칩 — 15개 이상이면 칩 80px·컨테이너 750px 로 축소(한 줄 8개), 그 미만이면 100px·806px
  const isLargeColorSet = showColors && product.colors.length >= A.chipsLargeThreshold;
  const baseChipSize = isLargeColorSet ? A.chipSizeLarge : A.chipSize;
  const baseChipGap = isLargeColorSet ? A.chipGapLarge : A.chipGap;
  const chipContainerWidth = isLargeColorSet ? A.chipsContainerWidthLarge : A.chipsContainerWidth;
  const isExtraLargeColorSet = showColors && product.colors.length >= A.chipsExtraLargeThreshold;
  const isSquishyboo = (product.name || '').includes('스퀴지보');

  // 비즈 가격 영역과 겹치지 않게 폭 제한 (A타입은 텍스트가 x 762 부터라 남는 폭이 좁음).
  // 컬러칩은 늘 가격 영역 높이에 오므로 제한, 상품설명은 가격 영역 위에서 끝나면 제한 안 함.
  const beadSpec = beadPrices ? pickBeadSpec(beadPrices, A_BEAD_SPEC, A_BEAD2_SPEC) : A_BEAD_SPEC;
  const beadTextWidth = beadPrices
    ? W - A.priceRight - beadBlockWidth(beadPrices, beadSpec) - beadSpec.textToPrice - textX
    : null;
  const subtitleBottom = textY + (product.name || '').split('\n').length * A.titleLineHeight
    + (hasSubtitle ? A.subtitleMarginTop + (product.subtitle || '').split('\n').length * A.subtitleLineHeight : 0);
  const descTop = subtitleBottom + (hasSubtitle ? A.descMarginTopWithSubtitle : A.descMarginTop);
  const descLines = (maxWidth: number) => estimateLines(product.description || '', A.descSize, maxWidth);
  const capDesc = beadPrices !== null && beadTextWidth !== null
    && descTop + descLines(A.textMaxWidth) * A.descLineHeight > beadRowsTop(beadPrices, beadSpec);
  const textBottom = showDesc
    ? descTop + descLines(capDesc ? beadTextWidth! : A.textMaxWidth) * A.descLineHeight
    : subtitleBottom;

  // 가격 앞까지 한 줄에 다 들어가면 120px 큰 칩, 위끝 y 573 (B타입과 같은 규칙, 스퀴지보 제외).
  // 그 외는 기존 칩 크기·간격, 비즈 상품이면 가격 영역 앞까지로 폭 제한.
  const chipsAvailWidth = beadTextWidth
    ?? W - A.priceRight - plainPriceWidth(product, A.priceFontSize, A.wonFontSize, A_PLAIN_STRIKE_SPEC) - A.chipsToPrice - textX;
  const colorCount = showColors ? product.colors.length : 0;
  const bigChips = colorCount > 0 && !isSquishyboo
    && colorCount * A.chipSizeBig + (colorCount - 1) * A.chipGapBig <= chipsAvailWidth;
  const chipSize = bigChips ? A.chipSizeBig : baseChipSize;
  const chipGap = bigChips ? A.chipGapBig : baseChipGap;
  const chipsMaxWidth = bigChips
    ? colorCount * chipSize + (colorCount - 1) * chipGap
    : beadTextWidth !== null
      ? Math.min(chipContainerWidth,
        Math.max(1, Math.floor((beadTextWidth + chipGap) / (chipSize + chipGap))) * (chipSize + chipGap) - chipGap)
      : chipContainerWidth;
  const chipsMarginTop = isSquishyboo ? 30
    : bigChips ? Math.max(A.chipsMinGapBig, A.chipsTopBig - textBottom)
    : (isExtraLargeColorSet ? A.chipsMarginTopExtraLarge : A.chipsMarginTop);

  return (
    <div style={{
      position: 'relative', width: W, height: H,
      backgroundColor: 'white', display: 'flex',
      fontFamily: FONT, overflow: 'hidden',
    }}>
      <ThumbnailBlock
        product={product}
        left={A.thumbX} top={A.thumbY} size={A.thumbSize}
        logoLeft={A.logoLeftInThumb} logoBottom={A.logoBottomInThumb}
        logoW={A.logoW} logoH={A.logoH}
      />
      <CircleImage product={product} thumbX={A.thumbX} thumbY={A.thumbY} thumbSize={A.thumbSize} />

      <div style={{
        position: 'absolute', left: textX, top: textY,
        display: 'flex', flexDirection: 'column',
        maxWidth: A.textMaxWidth,
      }}>
        <div style={{
          fontFamily: FONT, fontWeight: A.titleWeight, fontSize: A.titleSize,
          color: A.titleColor, lineHeight: `${A.titleLineHeight}px`,
          letterSpacing: A.titleLetterSpacing,
          display: 'flex', flexDirection: 'column',
        }}>
          {product.name?.split('\n').map((line, i) => (
            <span key={i} style={{ display: 'flex' }}>{line}</span>
          ))}
        </div>

        {hasSubtitle && (
          <div style={{
            fontFamily: FONT, fontWeight: A.subtitleWeight, fontSize: A.subtitleSize,
            color: A.subtitleColor, lineHeight: `${A.subtitleLineHeight}px`,
            letterSpacing: A.subtitleLetterSpacing,
            display: 'flex', flexDirection: 'column',
            marginTop: A.subtitleMarginTop,
          }}>
            {product.subtitle?.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'flex' }}>{line}</span>
            ))}
          </div>
        )}

        {showDesc && (
          <div style={{
            fontFamily: FONT, fontWeight: A.descWeight, fontSize: A.descSize,
            color: A.descColor, lineHeight: `${A.descLineHeight}px`,
            letterSpacing: A.descLetterSpacing,
            display: 'flex', flexDirection: 'column',
            marginTop: hasSubtitle ? A.descMarginTopWithSubtitle : A.descMarginTop,
            ...(capDesc ? { maxWidth: beadTextWidth! } : {}),
          }}>
            {product.description?.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'flex' }}>{line}</span>
            ))}
          </div>
        )}

        {showColors && (
          <ColorChips
            colors={product.colors}
            chipSize={chipSize} gap={chipGap}
            base64ColorChips={product._base64ColorChips}
            maxWidth={chipsMaxWidth}
            wrap fixedSize
            relative marginTop={chipsMarginTop}
          />
        )}
      </div>

      {beadPrices ? (
        <BeadPriceRows beadPrices={beadPrices} canvasW={W} right={A.priceRight} spec={beadSpec} />
      ) : hasSale ? (
        <>
          <PriceLine
            amount={product.salePrice}
            color={getSaleColor(product.discountRate)}
            fontSize={A.priceFontSize} wonSize={A.wonFontSize}
            right={A.priceRight} canvasW={W} top={A.priceTopY}
            wonAlignTop
          />
          <PlainStrikePrice
            amount={product.originalPrice} saleBoxTop={A.priceTopY}
            canvasW={W} right={A.priceRight} spec={A_PLAIN_STRIKE_SPEC}
          />
        </>
      ) : (
        <PriceLine
          amount={product.originalPrice}
          color={A.priceColor}
          fontSize={A.priceFontSize} wonSize={A.wonFontSize}
          right={A.priceRight} canvasW={W} top={A.priceTopY}
          wonAlignTop
        />
      )}

      {hasSale && (
        <SaleBadge
          rate={product.discountRate} product={product}
          right={A.badgeRight} top={A.badgeTop}
          w={A.badgeW} h={A.badgeH}
          saleSize={A.badgeSaleSize}
          numSize={A.badgeNumSize}
          pctSize={A.badgePctSize}
        />
      )}
    </div>
  );
}

export function TypeAPreview({ product }: { product: ProductData; baseUrl?: string }) {
  return <PriceCardA product={product} />;
}

// ═══════════════════════════════════════════════════════════
// 커스텀: 임의 width × height — 비율이 가까운 A·B 디자인(customBaseType)을 CSS transform 으로 비례 조정.
// PriceCardA(1984×803) 또는 PriceCardB(1984×602)를 그대로 렌더한 뒤 transform: scale() 로 캔버스에 맞춤.
// ═══════════════════════════════════════════════════════════
export function PriceCardCustom({ product, width, height }: { product: ProductData; width: number; height: number }) {
  const base = customBaseType(width, height);
  const REF_W = IMAGE_SPECS[base].width;
  const REF_H = IMAGE_SPECS[base].height;
  const scale = Math.min(width / REF_W, height / REF_H);
  const offsetX = (width - REF_W * scale) / 2;
  const offsetY = (height - REF_H * scale) / 2;
  return (
    <div style={{
      position: 'relative', width, height,
      backgroundColor: 'white', display: 'flex', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        left: offsetX, top: offsetY,
        width: REF_W, height: REF_H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        display: 'flex',
      }}>
        {base === 'A' ? <PriceCardA product={product} /> : <PriceCardB product={product} />}
      </div>
    </div>
  );
}

// ─── B타입 비즈별 가격 줄 ──────────────────────────────────
// Pretendard 글자 폭 (em, 폰트 파일 hmtx 값). 숫자는 비례폭 — 원본 시안도 비례폭.
const PRETENDARD_BOLD_ADVANCE: Record<string, number> = {
  '0': 0.660, '1': 0.469, '2': 0.610, '3': 0.639, '4': 0.657,
  '5': 0.627, '6': 0.643, '7': 0.575, '8': 0.644, '9': 0.643, ',': 0.287,
  '.': 0.282, 'k': 0.558, 'g': 0.608, // 수치 옵션 글자 (0.4kg)
};
const WON_ADVANCE_EM = 0.915;
// 고정폭 숫자(tnum) 폭 — satori 는 OpenType tnum 을 적용하지 않아 숫자마다 이 폭의 칸에 가운데 정렬로 그림
const PRETENDARD_BOLD_TNUM_EM = 0.654;

function charAdvance(ch: string, tabular: boolean): number {
  if (tabular && ch >= '0' && ch <= '9') return PRETENDARD_BOLD_TNUM_EM;
  return PRETENDARD_BOLD_ADVANCE[ch] ?? PRETENDARD_BOLD_TNUM_EM;
}

function hasSalePrice(p: { originalPrice: number; salePrice: number; discountRate: number }): boolean {
  return p.discountRate > 0 && p.salePrice > 0 && p.salePrice !== p.originalPrice;
}

// ₩ + 숫자 폭 (px) — 가격 영역 폭 계산용. A타입이 쓰는 estimatePriceWidth 와 달리 폰트 실측 폭 사용.
function inlinePriceWidth(amount: number, style: BeadPriceStyle): number {
  let em = 0;
  for (const ch of formatPrice(amount)) em += charAdvance(ch, style.tabular) + style.letterSpacing;
  return WON_ADVANCE_EM * style.wonSize + style.wonGap + em * style.fontSize;
}

// ₩ + 숫자 (flow 배치)
function InlinePrice({ amount, color, style, strike, spec: S }: {
  amount: number; color: string; style: BeadPriceStyle; strike?: boolean; spec: BeadSpec;
}) {
  const { fontSize, lineHeight, letterSpacing, wonSize, wonGap, wonTop, tabular } = style;
  const text = formatPrice(amount);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
      <span style={{
        fontFamily: FONT, fontWeight: 400, fontSize: wonSize, color,
        display: 'flex', flexShrink: 0, lineHeight: 1,
        marginTop: wonTop, marginRight: wonGap,
      }}>₩</span>
      <div style={{ display: 'flex', position: 'relative', flexShrink: 0 }}>
        <span style={{
          fontFamily: FONT, fontWeight: 700, fontSize, color,
          lineHeight: `${lineHeight}px`, letterSpacing: `${letterSpacing}em`,
          display: 'flex',
        }}>
          {tabular
            ? [...text].map((ch, i) => (
              <span key={i} style={{
                display: 'flex', justifyContent: 'center', flexShrink: 0,
                width: (charAdvance(ch, true) + letterSpacing) * fontSize,
              }}>{ch}</span>
            ))
            : text}
        </span>
        {strike && (
          <div style={{
            position: 'absolute', left: 0, width: '100%',
            top: (lineHeight - fontSize) / 2 + S.strikeLineCenter * fontSize - S.strikeLineThickness / 2,
            height: S.strikeLineThickness, backgroundColor: color, display: 'flex',
          }} />
        )}
      </div>
    </div>
  );
}

// 비즈 아이콘 — 원 안에 S / P / P+ (P+ 의 '+' 는 작게)
function BeadBadge({ bead, spec: S }: { bead: BeadType; spec: BeadSpec }) {
  const letter = { fontFamily: FONT, fontWeight: S.badgeFontWeight, color: 'white', display: 'flex', lineHeight: 1 } as const;
  return (
    <div style={{
      width: S.badgeSize, height: S.badgeSize, borderRadius: `${S.badgeSize / 2}px`,
      backgroundColor: S.badgeColors[bead],
      display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ ...letter, fontSize: S.badgeFontSize }}>{bead === 'P+' ? 'P' : bead}</span>
      {bead === 'P+' && <span style={{ ...letter, fontSize: S.badgePlusSize }}>+</span>}
    </div>
  );
}

// 비즈가 아닌 수치 옵션 (예: 0.4kg) — 숫자 + 작은 단위. 앞쪽 숫자 부분과 나머지(단위)로 나눔
function splitOptionLabel(label: string): { num: string; unit: string } {
  const m = label.trim().match(/^([\d.,]+)\s*(.*)$/);
  return m ? { num: m[1], unit: m[2] } : { num: label.trim(), unit: '' };
}

function OptionLabel({ label, spec: S }: { label: string; spec: BeadSpec }) {
  const { num, unit } = splitOptionLabel(label);
  const text = { fontFamily: FONT, fontWeight: 700, color: S.optionColor, display: 'flex', lineHeight: 1 } as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', flexShrink: 0 }}>
      <span style={{ ...text, fontSize: S.optionNumberSize }}>{num}</span>
      {unit && (
        <span style={{
          ...text, fontSize: S.optionUnitSize, marginLeft: S.optionUnitGap,
          // line-height 1 박스 아래끝 → baseline 거리가 글자 크기의 약 0.15 라 그 차이만큼 올려 baseline 맞춤
          marginBottom: (S.optionNumberSize - S.optionUnitSize) * 0.15,
        }}>{unit}</span>
      )}
    </div>
  );
}

function optionLabelWidth(label: string, S: BeadSpec): number {
  const { num, unit } = splitOptionLabel(label);
  let w = 0;
  for (const ch of num) w += (PRETENDARD_BOLD_ADVANCE[ch] ?? 0.6) * S.optionNumberSize;
  if (unit) {
    w += S.optionUnitGap;
    for (const ch of unit) w += (PRETENDARD_BOLD_ADVANCE[ch] ?? 0.6) * S.optionUnitSize;
  }
  return w;
}

// 아이콘 열 폭 — 비즈 아이콘 / 수치 옵션 글자 중 가장 넓은 것
function iconColumnWidth(beadPrices: BeadPrice[], S: BeadSpec): number {
  return Math.max(...beadPrices.map((bp) => (bp.bead ? S.badgeSize : optionLabelWidth(bp.label, S))));
}

// React key — 비즈면 S / P / P+, 수치 옵션이면 글자
function optionKey(bp: BeadPrice): string {
  return bp.bead ?? bp.label;
}

// 가격 영역 최소 폭 — 할인 줄이 하나라도 있으면 624, 아니면 421
function beadBlockMinWidth(beadPrices: BeadPrice[], S: BeadSpec): number {
  return beadPrices.some(hasSalePrice) ? S.minWidthSale : S.minWidthRegular;
}

// 첫 구분선 y — 수치 기준 줄 수보다 적으면 아래쪽(마지막 줄 위치)에 맞춰 붙임
function beadRowsTop(beadPrices: BeadPrice[], S: BeadSpec): number {
  return S.firstLineY + Math.max(0, S.rows - beadPrices.length) * S.rowPitch;
}

// 가격 영역 폭 — 상품설명·컬러칩 폭 제한 계산용. BeadPriceRows 의 열 구성과 같은 계산.
function beadBlockWidth(beadPrices: BeadPrice[], S: BeadSpec): number {
  if (S.stacked) {
    const col = Math.max(...beadPrices.map((bp) => hasSalePrice(bp)
      ? Math.max(inlinePriceWidth(bp.salePrice, S.sale), inlinePriceWidth(bp.originalPrice, S.strike))
      : inlinePriceWidth(bp.originalPrice, S.regular)));
    return Math.max(beadBlockMinWidth(beadPrices, S), iconColumnWidth(beadPrices, S) + S.badgeToPrice + col);
  }
  const saleRows = beadPrices.filter(hasSalePrice);
  const strikeCol = saleRows.length > 0
    ? Math.max(...saleRows.map((bp) => inlinePriceWidth(bp.originalPrice, S.strike))) + S.strikeToSale
    : 0;
  const mainCol = Math.max(...beadPrices.map((bp) => hasSalePrice(bp)
    ? inlinePriceWidth(bp.salePrice, S.sale)
    : inlinePriceWidth(bp.originalPrice, S.regular)));
  return Math.max(beadBlockMinWidth(beadPrices, S), iconColumnWidth(beadPrices, S) + S.badgeToPrice + strikeCol + mainCol);
}

// 텍스트 줄 수 추정 — 명시 줄바꿈 + maxWidth 자동 줄바꿈.
// 글자 폭은 렌더 결과 측정 근사 (Pretendard 한글 0.86em, 공백 0.25em, 그 외 0.6em — 자간 -3% 는 빼지 않아 약간 넉넉함)
function estimateLines(text: string, fontSize: number, maxWidth: number): number {
  return text.split('\n').reduce((n, line) => {
    let em = 0;
    for (const ch of line) em += /[가-힣]/.test(ch) ? 0.86 : ch === ' ' ? 0.25 : 0.6;
    return n + Math.max(1, Math.ceil((em * fontSize) / maxWidth));
  }, 0);
}

// 가격 줄 묶음 — 구분선 + 열 3개 [아이콘 | 취소선 정상가 | 할인가(또는 정상가만)].
// 원본 시안처럼 열 단위로 정렬: 가격 열은 각각 오른쪽 정렬이라 정상가끼리·할인가끼리 끝이 맞고,
// 숫자가 짧은 줄은 아이콘 쪽 간격이 벌어짐. 폭은 최소 폭(624 / 421)과 내용 중 큰 값, 오른쪽 끝은 right.
// satori 는 right 앵커를 렌더하지 않으므로, 캔버스 왼쪽부터 오른쪽 끝까지 잡은 박스 안에서 flex-end 로 붙인다.
function BeadPriceRows({ beadPrices, canvasW, right, spec: S }: {
  beadPrices: BeadPrice[]; canvasW: number; right: number; spec: BeadSpec;
}) {
  const top = beadRowsTop(beadPrices, S);
  const anySale = beadPrices.some(hasSalePrice);
  // 한 줄 칸 — 구분선 top 에서 lineToPrice 아래에 rowBoxHeight 높이 박스. 가격은 오른쪽 정렬, 아이콘 칸은 가운데.
  // 가격은 박스 아래끝 정렬 (정상가 line-height 60 이 할인가와 baseline 을 맞춰 줌), 아이콘은 세로 중앙.
  const cell = (
    key: string, content: React.ReactNode,
    alignItems: 'flex-start' | 'flex-end' | 'center', justifyContent: 'flex-end' | 'center' = 'flex-end',
  ) => (
    <div key={key} style={{
      display: 'flex', flexDirection: 'row', justifyContent, alignItems,
      height: S.rowBoxHeight,
      marginTop: S.lineToPrice,
      marginBottom: S.rowPitch - S.lineToPrice - S.rowBoxHeight,
    }}>{content}</div>
  );
  return (
    <div style={{
      position: 'absolute', left: 0, top, width: canvasW - right,
      display: 'flex', flexDirection: 'row', justifyContent: 'flex-end',
    }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'row', minWidth: beadBlockMinWidth(beadPrices, S) }}>
        {beadPrices.map((bp, i) => (
          <div key={`line-${optionKey(bp)}`} style={{
            position: 'absolute', left: 0, top: i * S.rowPitch, width: '100%',
            height: S.lineWidth, backgroundColor: S.lineColor, display: 'flex',
          }} />
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', marginRight: S.badgeToPrice }}>
          {beadPrices.map((bp) => cell(
            optionKey(bp),
            bp.bead ? <BeadBadge bead={bp.bead} spec={S} /> : <OptionLabel label={bp.label} spec={S} />,
            'center', 'center',
          ))}
        </div>
        <div style={{ display: 'flex', flexGrow: 1 }} />
        {anySale && !S.stacked && (
          <div style={{ display: 'flex', flexDirection: 'column', marginRight: S.strikeToSale }}>
            {beadPrices.map((bp) => cell(optionKey(bp), hasSalePrice(bp)
              ? <InlinePrice amount={bp.originalPrice} color={TEXT_COLOR} style={S.strike} strike spec={S} />
              : null, 'flex-end'))}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {beadPrices.map((bp) => {
            const sale = hasSalePrice(bp);
            const main = (
              <InlinePrice
                amount={sale ? bp.salePrice : bp.originalPrice}
                color={sale ? getBeadSaleColor(bp.discountRate) : TEXT_COLOR}
                style={sale ? S.sale : S.regular}
                spec={S}
              />
            );
            if (!(sale && S.stacked)) return cell(optionKey(bp), main, 'flex-end');
            // 2줄 디자인 할인: 할인가 위, 취소선 정상가 아래 (둘 다 오른쪽 정렬, 위치는 구분선 기준 saleTop / strikeTop)
            return cell(optionKey(bp), (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                marginTop: S.saleTop - S.lineToPrice,
              }}>
                {main}
                <div style={{ display: 'flex', marginTop: S.strikeTop - S.saleTop - S.sale.lineHeight }}>
                  <InlinePrice amount={bp.originalPrice} color={TEXT_COLOR} style={S.strike} strike spec={S} />
                </div>
              </div>
            ), 'flex-start');
          })}
        </div>
      </div>
    </div>
  );
}

// 비즈 없는 상품의 가격(할인가 PriceLine + 작은 취소선 정상가) 폭 — 컬러칩 한 줄 판단용.
// 폰트 실측 글자 폭 기준 (estimatePriceWidth 는 좁게 잡혀 겹침 판단엔 부족). PriceLine 자간 -5%·₩ 간격 반영.
function plainPriceWidth(product: ProductData, fontSize: number, wonSize: number, strikeSpec: BeadSpec): number {
  const lineWidth = (amount: number) => {
    let em = 0;
    for (const ch of formatPrice(amount)) em += PRETENDARD_BOLD_ADVANCE[ch] ?? PRETENDARD_BOLD_TNUM_EM;
    const text = formatPrice(amount);
    return em * fontSize - Math.round(fontSize * 0.05) * text.length + WON_ADVANCE_EM * wonSize + Math.round(fontSize * 0.12);
  };
  return hasSalePrice(product)
    ? Math.max(lineWidth(product.salePrice), inlinePriceWidth(product.originalPrice, strikeSpec.strike))
    : lineWidth(product.originalPrice);
}

// 비즈 없는 상품의 취소선 정상가 — 할인가와 같은 크기는 너무 커서 비즈 2줄 디자인의 취소선 스타일(50/60, -4%) 사용.
// 할인가 박스 위(saleBoxTop)에서 (strikeTop - saleTop) 아래, 오른쪽 끝 정렬. A타입은 1.26배 키운 spec 으로.
function PlainStrikePrice({ amount, saleBoxTop, canvasW, right, spec: S }: {
  amount: number; saleBoxTop: number; canvasW: number; right: number; spec: BeadSpec;
}) {
  return (
    <div style={{
      position: 'absolute', left: 0, top: saleBoxTop + S.strikeTop - S.saleTop, width: canvasW - right,
      display: 'flex', flexDirection: 'row', justifyContent: 'flex-end',
    }}>
      <InlinePrice amount={amount} color={TEXT_COLOR} style={S.strike} strike spec={S} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// B타입: 1984 × 602 — 절대 픽셀 기반 신규 디자인
// 좌측 썸네일 500×500, 우측 텍스트 영역(상품명/서브타이틀/상품설명) + 컬러칩,
// 우측 하단에 가격, 우측 상단에 SALE 배지.
// ═══════════════════════════════════════════════════════════
function PriceCardB({ product }: { product: ProductData }) {
  const W = 1984, H = 602;
  const B = B_TYPE_SPEC;

  // 비즈별 가격이 있으면 S / P / P+ 가격 줄로, 없으면 기존 가격 1개
  const beadPrices = product.beadPrices && product.beadPrices.length > 0 ? product.beadPrices : null;
  const hasSale = beadPrices ? beadPrices.some(hasSalePrice) : hasSalePrice(product);
  const showDesc = product.description && product.description !== '없음';
  const showColors = product.colors?.length > 0
    && !product.colors.includes('없음')
    && !product.colors.includes('이미지');
  const hasSubtitle = !!product.subtitle;

  // 텍스트 영역 시작 좌표 — 비즈 상품만 새 디자인 위치(x 630), 비즈 없는 상품은 기존(x 700)
  const textX = B.thumbX + B.thumbSize + (beadPrices ? B.beadThumbToTextGap : B.thumbToTextGap);
  const textY = B.textY;
  const textMaxWidth = beadPrices ? B.beadTextMaxWidth : B.textMaxWidth;

  // 상품명 기반 컬러칩 한 줄 개수
  //   스퀴지보 → 10개/줄, 메이트 → 8개/줄, 그 외 → 7개/줄
  const productName = product.name || '';
  const isSquishyboo = productName.includes('스퀴지보');
  const baseChipsPerRow = isSquishyboo ? 10
    : productName.includes('메이트') ? 8
    : 7;
  // 비즈 가격 줄은 세로로 길어 상품설명·컬러칩 높이와 겹치므로, 가격 영역 왼쪽 끝까지만 쓰도록 폭 제한
  const beadSpec = beadPrices ? pickBeadSpec(beadPrices, B_BEAD_SPEC, B_BEAD2_SPEC) : B_BEAD_SPEC;
  const beadTextWidth = beadPrices
    ? W - B.priceRight - beadBlockWidth(beadPrices, beadSpec) - beadSpec.textToPrice - textX
    : null;
  // 가격 앞까지 한 줄에 다 들어가면 120px 큰 칩 (스퀴지보는 기존 이미지 칩 배치 유지), 안 들어가면 기존 80px 규칙.
  // 쓸 수 있는 폭: 비즈 상품은 가격 영역 앞까지, 비즈 없는 상품은 우측 하단 가격 앞까지.
  const chipsAvailWidth = beadTextWidth
    ?? W - B.priceRight - plainPriceWidth(product, B.priceFontSize, B.wonFontSize, B_BEAD2_SPEC) - B.chipsToPrice - textX;
  const colorCount = showColors ? product.colors.length : 0;
  const bigChips = colorCount > 0 && !isSquishyboo
    && colorCount * B.chipSizeBig + (colorCount - 1) * B.chipGapBig <= chipsAvailWidth;
  const chipSize = bigChips ? B.chipSizeBig : B.chipSize;
  const chipGap = bigChips ? B.chipGapBig : B.chipGap;
  const chipsPerRow = bigChips
    ? colorCount
    : beadTextWidth !== null
      ? Math.max(1, Math.min(baseChipsPerRow, Math.floor((beadTextWidth + chipGap) / (chipSize + chipGap))))
      : baseChipsPerRow;
  const chipContainerWidth = chipSize * chipsPerRow + chipGap * (chipsPerRow - 1);
  // 큰 칩은 위끝을 y 403 에 맞춤 — 설명 끝 위치를 줄 수로 추정해 margin-top 계산 (넘어오면 최소 간격)
  const descMaxWidth = beadTextWidth ?? textMaxWidth;
  const descBottom = textY + (product.name || '').split('\n').length * B.titleLineHeight
    + (hasSubtitle ? B.subtitleMarginTop + (product.subtitle || '').split('\n').length * B.subtitleLineHeight : 0)
    + (showDesc
      ? (hasSubtitle ? B.descMarginTopWithSubtitle : B.descMarginTop)
        + estimateLines(product.description || '', B.descSize, descMaxWidth) * B.descLineHeight
      : 0);
  // 스퀴지보 → margin-top 15px / 큰 칩 → y 403 맞춤 / 그 외 → 기본
  const chipsMarginTop = isSquishyboo ? 15
    : bigChips ? Math.max(B.chipsMinGapBig, B.chipsTopBig - descBottom)
    : B.chipsMarginTop;
  // 여러 줄 칩이 썸네일 아래끝보다 내려가면 칩·간격을 같은 비율로 줄여 한 줄에 더 넣음 (넘치지 않으면 그대로)
  const chipsRowWidth = beadTextWidth ?? chipContainerWidth;
  const chipsFit = (size: number) => {
    const gap = size * (chipGap / chipSize);
    const perRow = size === chipSize ? chipsPerRow : Math.max(1, Math.floor((chipsRowWidth + gap) / (size + gap)));
    const rows = Math.ceil(colorCount / perRow);
    return { size, gap, perRow, bottom: descBottom + chipsMarginTop + rows * size + (rows - 1) * gap };
  };
  let chips = chipsFit(chipSize);
  while (colorCount > 0 && chips.bottom > B.thumbY + B.thumbSize && chips.size - 4 >= B.chipSizeMin) {
    chips = chipsFit(chips.size - 4);
  }

  return (
    <div style={{
      position: 'relative', width: W, height: H,
      backgroundColor: 'white', display: 'flex',
      fontFamily: FONT, overflow: 'hidden',
    }}>
      {/* 대표이미지 (500×500) + 로고 오버레이 */}
      <ThumbnailBlock
        product={product}
        left={B.thumbX} top={B.thumbY} size={B.thumbSize}
        logoLeft={B.logoLeftInThumb} logoBottom={B.logoBottomInThumb}
        logoW={B.logoW} logoH={B.logoH}
      />
      <CircleImage product={product} thumbX={B.thumbX} thumbY={B.thumbY} thumbSize={B.thumbSize} />

      {/* 텍스트 영역: 상품명 → (서브타이틀) → 상품설명 → 컬러칩 (위에서 아래로) */}
      <div style={{
        position: 'absolute', left: textX, top: textY,
        display: 'flex', flexDirection: 'column',
        maxWidth: textMaxWidth,
      }}>
        {/* 상품명 */}
        <div style={{
          fontFamily: FONT, fontWeight: B.titleWeight, fontSize: B.titleSize,
          color: B.titleColor, lineHeight: `${B.titleLineHeight}px`,
          letterSpacing: B.titleLetterSpacing,
          display: 'flex', flexDirection: 'column',
        }}>
          {product.name?.split('\n').map((line, i) => (
            <span key={i} style={{ display: 'flex' }}>{line}</span>
          ))}
        </div>

        {/* 서브타이틀 */}
        {hasSubtitle && (
          <div style={{
            fontFamily: FONT, fontWeight: B.subtitleWeight, fontSize: B.subtitleSize,
            color: B.subtitleColor, lineHeight: `${B.subtitleLineHeight}px`,
            letterSpacing: B.subtitleLetterSpacing,
            display: 'flex', flexDirection: 'column',
            marginTop: B.subtitleMarginTop,
          }}>
            {product.subtitle?.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'flex' }}>{line}</span>
            ))}
          </div>
        )}

        {/* 상품설명 — 서브타이틀 없을 때 37px, 있을 때 60px */}
        {showDesc && (
          <div style={{
            fontFamily: FONT, fontWeight: B.descWeight, fontSize: B.descSize,
            color: B.descColor, lineHeight: `${B.descLineHeight}px`,
            letterSpacing: B.descLetterSpacing,
            display: 'flex', flexDirection: 'column',
            marginTop: hasSubtitle ? B.descMarginTopWithSubtitle : B.descMarginTop,
            ...(beadTextWidth !== null ? { maxWidth: beadTextWidth } : {}),
          }}>
            {product.description?.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'flex' }}>{line}</span>
            ))}
          </div>
        )}

        {/* 컬러칩 — 텍스트 column 안에 위치(A타입과 동일).
             크기: 한 줄에 들어가면 120 / 그 외 80. margin-top: 스퀴지보 15 / 120px 칩 위끝 y 403 / 기본 60
             상품명별로 한 줄 개수 분기: 스퀴지보 10 / 메이트 8 / 기본 7 */}
        {showColors && (
          <ColorChips
            colors={product.colors}
            chipSize={chips.size} gap={chips.gap}
            base64ColorChips={product._base64ColorChips}
            maxWidth={chips.perRow * chips.size + (chips.perRow - 1) * chips.gap}
            wrap fixedSize
            relative marginTop={chipsMarginTop}
          />
        )}
      </div>

      {/* 가격 — 비즈 있으면 S / P / P+ 줄, 없으면 우측 하단 1개 (₩ 상단 정렬) */}
      {beadPrices ? (
        <BeadPriceRows beadPrices={beadPrices} canvasW={W} right={B.priceRight} spec={beadSpec} />
      ) : hasSale ? (
        <>
          <PriceLine
            amount={product.salePrice}
            color={getSaleColor(product.discountRate)}
            fontSize={B.priceFontSize} wonSize={B.wonFontSize}
            right={B.priceRight} canvasW={W} top={B.priceTopY}
            wonAlignTop
          />
          <PlainStrikePrice
            amount={product.originalPrice} saleBoxTop={B.priceTopY}
            canvasW={W} right={B.priceRight} spec={B_BEAD2_SPEC}
          />
        </>
      ) : (
        <PriceLine
          amount={product.originalPrice}
          color={B.priceColor}
          fontSize={B.priceFontSize} wonSize={B.wonFontSize}
          right={B.priceRight} canvasW={W} top={B.priceTopY}
          wonAlignTop
        />
      )}

      {/* SALE 배지 */}
      {hasSale && (
        <SaleBadge
          rate={product.discountRate} product={product}
          right={B.badgeRight} top={B.badgeTop}
          w={B.badgeW} h={B.badgeH}
          saleSize={B.badgeSaleSize}
          numSize={B.badgeNumSize}
          pctSize={B.badgePctSize}
        />
      )}
    </div>
  );
}

export function TypeBPreview({ product }: { product: ProductData; baseUrl?: string }) {
  return <PriceCardB product={product} />;
}

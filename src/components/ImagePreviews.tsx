import { ProductData } from '@/types/product';

function imgUrl(filename: string): string {
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
const SALE_COLOR = '#E5006C';
const STRIKE_COLOR = '#C2C2C2';
const THUMB_BG = 'rgb(245, 245, 245)';

function getSaleColor(rate: number): string {
  if (rate >= 20) return '#BE1D2C';
  if (rate >= 15) return '#E83817';
  if (rate >= 10) return SALE_COLOR;
  return '#E91E8C';
}

function getProxyUrl(url: string) {
  if (!url) return url;
  if (typeof window === 'undefined') return url;
  if (url.startsWith('http')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
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
  titleSize: 92,
  titleLineHeight: 92, // 100%
  titleLetterSpacing: 'normal', // 0%
  titleWeight: 800,
  titleColor: '#474F57',
  // 서브타이틀
  subtitleSize: 54,
  subtitleLineHeight: 54, // 100%
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
  // 컬러칩: 100px, gap 20px, 컨테이너 806px → 한 줄 최대 6개 (wrap)
  // 텍스트 column flex 안에 위치 → 상품설명으로부터 margin-top 85px
  chipSize: 100,
  chipGap: 20,
  chipsContainerWidth: 806,
  chipsMarginTop: 85,
  // 15개 이상일 때 — 칩 95px 로 축소하고 컨테이너를 750px 로 잡아 wrap
  chipsLargeThreshold: 15,
  chipSizeLarge: 95,
  chipGapLarge: 15,
  chipsContainerWidthLarge: 750,
  // 20개 이상일 때 — margin-top 만 60px 로 축소 (행 수가 많아 위 여백 줄임)
  chipsExtraLargeThreshold: 20,
  chipsMarginTopExtraLarge: 60,
  // SALE 배지 — 우측 상단 (원래 Figma 위치 복원)
  badgeRight: 40,
  badgeTop: 0,
  badgeW: 220,
  badgeH: 190,
  badgeSaleSize: 54.6,
  badgeNumSize: 79.8,
  badgePctSize: 50,
  // 텍스트 영역 maxWidth — 배지 좌측 가장자리(1724)를 침범하지 않도록
  textMaxWidth: 920,
};

// B타입 전용 스펙 — 실제 렌더 픽셀(1984×602) 기준.
const B_TYPE_SPEC = {
  // 대표이미지 (썸네일): 500×500, 좌측 패딩 60, 세로 중앙 정렬
  thumbSize: 500,
  thumbX: 60,
  thumbY: 51, // (602 - 500) / 2
  thumbToTextGap: 140, // 썸네일 우측 → 타이틀 좌측 간격
  // 로고 (썸네일 좌하단 오버레이) — 썸네일 사이즈에 맞춰 비례
  logoW: 150,
  logoH: 60,
  logoLeftInThumb: 30,
  logoBottomInThumb: 15,
  // 우측 텍스트 영역 y 시작 (상품명 margin-top 105px)
  textY: 105,
  textMaxWidth: 900,
  // 상품명
  titleSize: 73,
  titleLineHeight: 73, // 100%
  titleLetterSpacing: 'normal', // 0%
  titleWeight: 800,
  titleColor: '#474F57',
  // 서브타이틀
  subtitleSize: 42,
  subtitleLineHeight: 42, // 100% (명시 없음, 추정)
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
  // SALE 배지 — 우측 상단
  badgeRight: 40,
  badgeTop: 0,
  badgeW: 180,
  badgeH: 156,
  badgeSaleSize: 45,
  badgeNumSize: 66,
  badgePctSize: 41,
};

// ─── 썸네일 블록 ────────────────────────────────────────────
function ThumbnailBlock({
  product, left, top, size, logoLeft, logoBottom, logoW, logoH,
}: {
  product: ProductData; left: number; top: number; size: number;
  logoLeft: number; logoBottom: number; logoW: number; logoH: number;
}) {
  const thumbUrl = product._base64Thumb || getProxyUrl(imgUrl(product.thumbnailImage));
  const logoUrl = product._base64Logo || getProxyUrl("https://yogibo.openhost.cafe24.com/web/img/icon/logo3_on.png");
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

  const hasSale = product.discountRate > 0 && product.salePrice > 0 && product.salePrice !== product.originalPrice;
  const showDesc = product.description && product.description !== '없음';
  const showColors = product.colors?.length > 0
    && !product.colors.includes('없음')
    && !product.colors.includes('이미지');
  const hasSubtitle = !!product.subtitle;

  // 텍스트 영역 시작 좌표
  const textX = A.thumbX + A.thumbSize + A.thumbToTextGap;
  const textY = A.textY;

  // 컬러칩 — 15개 이상이면 칩 95px·컨테이너 750px 로 축소, 그 미만이면 100px·806px
  const isLargeColorSet = showColors && product.colors.length >= A.chipsLargeThreshold;
  const chipSize = isLargeColorSet ? A.chipSizeLarge : A.chipSize;
  const chipGap = isLargeColorSet ? A.chipGapLarge : A.chipGap;
  const chipContainerWidth = isLargeColorSet ? A.chipsContainerWidthLarge : A.chipsContainerWidth;
  const isExtraLargeColorSet = showColors && product.colors.length >= A.chipsExtraLargeThreshold;
  const isSquishyboo = (product.name || '').includes('스퀴지보');
  const chipsMarginTop = isSquishyboo
    ? 15
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
            maxWidth={chipContainerWidth}
            wrap fixedSize
            relative marginTop={chipsMarginTop}
          />
        )}
      </div>

      {hasSale ? (
        <>
          <PriceLine
            amount={product.salePrice}
            color={getSaleColor(product.discountRate)}
            fontSize={A.priceFontSize} wonSize={A.wonFontSize}
            right={A.priceRight} canvasW={W} top={A.priceTopY}
            wonAlignTop
          />
          <PriceLine
            amount={product.originalPrice}
            color={A.priceColor}
            fontSize={A.priceFontSize} wonSize={A.wonFontSize}
            right={A.priceRight} canvasW={W} top={A.priceBottomY}
            strike wonAlignTop
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
// 커스텀: 임의 width × height — A타입 디자인을 CSS transform 으로 비례 축소.
// PriceCardA(1984×803)를 그대로 렌더한 뒤 transform: scale() 로 캔버스에 맞춤.
// ═══════════════════════════════════════════════════════════
export function PriceCardCustom({ product, width, height }: { product: ProductData; width: number; height: number }) {
  const REF_W = 1984;
  const REF_H = 803;
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
        <PriceCardA product={product} />
      </div>
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

  const hasSale = product.discountRate > 0 && product.salePrice > 0 && product.salePrice !== product.originalPrice;
  const showDesc = product.description && product.description !== '없음';
  const showColors = product.colors?.length > 0
    && !product.colors.includes('없음')
    && !product.colors.includes('이미지');
  const hasSubtitle = !!product.subtitle;

  // 텍스트 영역 시작 좌표
  const textX = B.thumbX + B.thumbSize + B.thumbToTextGap;
  const textY = B.textY;

  // 상품명 기반 컬러칩 한 줄 개수
  //   스퀴지보 → 10개/줄, 메이트 → 8개/줄, 그 외 → 7개/줄
  const productName = product.name || '';
  const isSquishyboo = productName.includes('스퀴지보');
  const chipsPerRow = isSquishyboo ? 10
    : productName.includes('메이트') ? 8
    : 7;
  const chipContainerWidth = B.chipSize * chipsPerRow + B.chipGap * (chipsPerRow - 1);
  // 스퀴지보 → margin-top 15px / 그 외 → 기본
  const chipsMarginTop = isSquishyboo ? 15 : B.chipsMarginTop;

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

      {/* 텍스트 영역: 상품명 → (서브타이틀) → 상품설명 → 컬러칩 (위에서 아래로) */}
      <div style={{
        position: 'absolute', left: textX, top: textY,
        display: 'flex', flexDirection: 'column',
        maxWidth: B.textMaxWidth,
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
          }}>
            {product.description?.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'flex' }}>{line}</span>
            ))}
          </div>
        )}

        {/* 컬러칩 — 텍스트 column 안에 위치(A타입과 동일).
             margin-top: 스퀴지보 15 / 기본 60
             상품명별로 한 줄 개수 분기: 스퀴지보 10 / 메이트 8 / 기본 7 */}
        {showColors && (
          <ColorChips
            colors={product.colors}
            chipSize={B.chipSize} gap={B.chipGap}
            base64ColorChips={product._base64ColorChips}
            maxWidth={chipContainerWidth}
            wrap fixedSize
            relative marginTop={chipsMarginTop}
          />
        )}
      </div>

      {/* 가격 — 우측 하단, ₩ 상단 정렬 */}
      {hasSale ? (
        <>
          <PriceLine
            amount={product.salePrice}
            color={getSaleColor(product.discountRate)}
            fontSize={B.priceFontSize} wonSize={B.wonFontSize}
            right={B.priceRight} canvasW={W} top={B.priceTopY}
            wonAlignTop
          />
          <PriceLine
            amount={product.originalPrice}
            color={B.priceColor}
            fontSize={B.priceFontSize} wonSize={B.wonFontSize}
            right={B.priceRight} canvasW={W} top={B.priceBottomY}
            strike wonAlignTop
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

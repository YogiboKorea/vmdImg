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
 * A타입(1984×602): sx=2.0, sy=1.498
 * B타입(1984×803): sx=2.0, sy≈2.0  (Figma 그대로 2배)
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
  colors, left, top, chipSize, gap, base64ColorChips, maxWidth,
}: {
  colors: string[]; left: number; top: number; chipSize: number; gap: number;
  base64ColorChips?: (string | null)[];
  maxWidth?: number;
}) {
  if (!colors || colors.length === 0) return null;

  // 컬러 개수가 많아서 maxWidth 를 넘으면 칩 사이즈/간격을 비례 축소.
  // gap : chipSize 비율은 시안 그대로 유지.
  const gapRatio = chipSize > 0 ? gap / chipSize : 0.317;
  const requiredWidth = colors.length * chipSize + Math.max(0, colors.length - 1) * gap;
  let actualChipSize = chipSize;
  let actualGap = gap;
  if (maxWidth && requiredWidth > maxWidth) {
    actualChipSize = maxWidth / (colors.length + Math.max(0, colors.length - 1) * gapRatio);
    actualGap = actualChipSize * gapRatio;
  }

  return (
    <div style={{
      position: 'absolute', left, top,
      display: 'flex', flexDirection: 'row', alignItems: 'center', gap: actualGap,
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
        return (
          <div key={`${color}-${i}`} style={{
            width: actualChipSize, height: actualChipSize, borderRadius: 9999,
            display: 'flex', overflow: 'hidden',
            backgroundColor: isImg ? 'rgba(0,0,0,0)' : colorVal,
            flexShrink: 0, flexGrow: 0,
          }}>
            {isImg && bgImgUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bgImgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={color} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── 가격 한 줄 (₩ + 숫자, 오른쪽 정렬) ──────────────────────
function PriceLine({
  amount, color, fontSize, wonSize, right, top, strike,
}: {
  amount: number; color: string; fontSize: number; wonSize: number;
  right: number; top: number; strike?: boolean;
}) {
  return (
    <div style={{
      position: 'absolute', right, top,
      display: 'flex', flexDirection: 'row', alignItems: 'flex-end',
    }}>
      <span style={{
        fontFamily: FONT, fontWeight: 700, fontSize: wonSize, color,
        display: 'flex', flexShrink: 0, marginRight: Math.round(fontSize * 0.12),
        // ₩ 는 숫자 baseline 보다 살짝 아래 정렬 (Figma 의 y 오프셋 +9 유사 효과)
        paddingBottom: Math.round(fontSize * 0.04),
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
            right={priceRight} top={posY(FIGMA.priceTopY)}
          />
          <PriceLine
            amount={product.originalPrice}
            color={STRIKE_COLOR}
            fontSize={FIGMA.priceTopSize * sf}
            wonSize={FIGMA.wonSize * sf}
            right={priceRight} top={posY(FIGMA.priceBottomY)}
            strike
          />
        </>
      ) : (
        <PriceLine
          amount={product.originalPrice}
          color={TEXT_COLOR}
          fontSize={FIGMA.priceTopSize * sf}
          wonSize={FIGMA.wonSize * sf}
          right={priceRight} top={posY(FIGMA.priceTopY)}
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
// A타입: 1984 × 602 (Figma 가로 2x, 세로 1.498x)
// ═══════════════════════════════════════════════════════════
export function TypeAPreview({ product }: { product: ProductData; baseUrl?: string }) {
  return <PriceCard product={product} width={1984} height={602} />;
}

// ═══════════════════════════════════════════════════════════
// B타입: 1984 × 803 (Figma 균등 2x)
// ═══════════════════════════════════════════════════════════
export function TypeBPreview({ product }: { product: ProductData; baseUrl?: string }) {
  return <PriceCard product={product} width={1984} height={803} />;
}

import { ProductData } from '@/types/product';

function imgUrl(filename: string): string {
  if (!filename) return '';
  const clean = filename.trim().replace(/^\/+/, '');
  return `http://yogibo.openhost.cafe24.com/web/vmd/${clean}`;
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

function getColor(name: string): string {
  const norm = name.replace(/\s+/g, '');
  const normKey = Object.keys(COLOR_MAP).find(k => k.replace(/\s+/g, '') === norm);
  if (normKey) return COLOR_MAP[normKey];
  const partial = Object.keys(COLOR_MAP).find(
    k => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
  );
  return partial ? COLOR_MAP[partial] : '#CCCCCC';
}

function formatPrice(n: number) {
  return n.toLocaleString('ko-KR');
}

/*
 * ──── 변경 사항 요약 ────────────────────────────────────
 *
 * 1. 폰트: Noto Sans KR → Pretendard
 *    - Noto Sans KR의 "korean" subset에 ₩(U+20A9) 미포함 → □ 깨짐
 *    - Pretendard는 full font이므로 ₩ 포함
 *    - FONT_LATIN 제거, 모든 곳에서 FONT 하나로 통일
 *
 * 2. satori(yoga) vs 브라우저 flex 기본값 차이 보정:
 *    | 속성       | 브라우저 | satori(yoga) |
 *    |-----------|---------|-------------|
 *    | flexShrink | 1       | 0           |
 *    | flexGrow   | 0       | 0           |
 *
 *    → flex:1 사용 시 반드시 flexGrow:1, flexShrink:1, flexBasis:0 명시
 *    → 고정 크기 요소에는 flexShrink:0, flexGrow:0 명시
 *    → 텍스트 span에 display:'flex' 추가 (satori inline 렌더링 차이)
 *    → h2 → div 변경 (satori block element 처리 차이)
 * ────────────────────────────────────────────────────────
 */
const FONT = 'Pretendard';
const TEXT_COLOR = '#474F57';
const THUMB_BG = 'rgb(245, 245, 245)';

function getSaleColor(rate: number): string {
  if (rate >= 20) return '#BE1D2C';
  if (rate >= 15) return '#E83817';
  if (rate >= 10) return '#E5006C';
  return '#E91E8C';
}

function getProxyUrl(url: string, baseUrl?: string) {
  if (!url) return url;
  const isServer = typeof window === 'undefined';
  if (isServer) return url;
  if (url.startsWith('http')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

// ─── ₩ 기호 ────────────────────────────────────────────
function WonSign({ size, color }: { size: number; color: string }) {
  return (
    <span style={{
      fontFamily: FONT, fontSize: size, color, fontWeight: 700,
      marginRight: 2, display: 'flex', flexShrink: 0,
    }}>
      ₩
    </span>
  );
}

// ─── 썸네일 ─────────────────────────────────────────────
function Thumbnail({ product, height, baseUrl }: { product: ProductData; height: number; baseUrl?: string }) {
  const thumbUrl = product._base64Thumb || getProxyUrl(imgUrl(product.thumbnailImage), baseUrl);
  const logoUrl = product._base64Logo || getProxyUrl("https://yogibo.openhost.cafe24.com/web/img/icon/logo3_on.png", baseUrl);
  const radius = Math.round(height * 0.42);

  return (
    <div style={{
      display: 'flex', width: height, height,
      flexShrink: 0, flexGrow: 0,
      position: 'relative', background: THUMB_BG, overflow: 'hidden',
      borderTopLeftRadius: 0, borderTopRightRadius: radius,
      borderBottomRightRadius: 0, borderBottomLeftRadius: 0,
    }}>
      <img
        src={thumbUrl} alt={product.name}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <img
        src={logoUrl} alt="yogibo"
        style={{
          position: 'absolute',
          bottom: Math.floor(height * 0.05), left: Math.floor(height * 0.06),
          height: Math.floor(height * 0.08), width: Math.floor(height * 0.28),
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

// ─── 컬러칩 ─────────────────────────────────────────────
function ColorList({ colors, chipSize = 48, base64ColorChips }: { colors: string[]; chipSize?: number; base64ColorChips?: (string | null)[] }) {
  const gapSize = Math.floor(chipSize * 0.35);
  return (
    <div style={{ display: 'flex', gap: gapSize, alignItems: 'center', flexWrap: 'wrap', flexShrink: 1, flexGrow: 0 }}>
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
          <div
            key={`${color}-${i}`}
            style={{
              width: chipSize, height: chipSize, borderRadius: 9999,
              display: 'flex', overflow: 'hidden',
              backgroundColor: isImg ? 'rgba(0,0,0,0)' : colorVal,
              borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(0,0,0,0.12)',
              flexShrink: 0, flexGrow: 0,
            }}
          >
            {isImg && bgImgUrl && <img src={bgImgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={color} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── 가격 섹션 ───────────────────────────────────────────
function PriceSection({ product, fontSize = 86 }: { product: ProductData; fontSize?: number }) {
  const hasSale = product.discountRate > 0 && product.salePrice > 0 && product.salePrice !== product.originalPrice;
  const saleColor = getSaleColor(product.discountRate);
  const wonSize = Math.floor(fontSize * 0.5);
  // 정상가도 할인가와 동일한 폰트 사이즈를 사용하도록 수정
  const strikeSize = fontSize; 
  const strikeWonSize = wonSize;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, flexGrow: 0 }}>
      {hasSale ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, flexGrow: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end',
            fontFamily: FONT, fontWeight: 700, fontSize, color: saleColor, lineHeight: 1,
          }}>
            <WonSign size={wonSize} color={saleColor} />
            <span style={{ display: 'flex', flexShrink: 0 }}>{formatPrice(product.salePrice)}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'flex-end',
            fontFamily: FONT, fontWeight: 600, fontSize: strikeSize, color: '#999', lineHeight: 1,
          }}>
            <WonSign size={strikeWonSize} color="#999" />
            <span style={{ textDecoration: 'line-through', display: 'flex', flexShrink: 0 }}>{formatPrice(product.originalPrice)}</span>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'baseline',
          fontFamily: FONT, fontWeight: 700, fontSize, color: TEXT_COLOR, lineHeight: 1,
        }}>
          <WonSign size={wonSize} color={TEXT_COLOR} />
          <span style={{ display: 'flex', flexShrink: 0 }}>{formatPrice(product.originalPrice)}</span>
        </div>
      )}
    </div>
  );
}

// ─── SALE 배지 ─────────────────────────────────────────
function SaleBadge({ rate, product, size = 100 }: { rate: number; product?: ProductData; size?: number }) {
  if (!rate) return null;
  const supported = [10, 15, 20];
  const exact = supported.find(r => r === rate);
  const badgeUrl = product?._base64Badge || (exact ? `http://yogibo.openhost.cafe24.com/web/vmd/${exact}.png` : null);

  if (badgeUrl) {
    return (
      <img
        src={badgeUrl} alt={`SALE ${rate}%`}
        style={{ width: size, height: Math.floor(size * 1.1), objectFit: 'contain', flexShrink: 0, flexGrow: 0 }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: Math.floor(size * 1.1),
      backgroundColor: getSaleColor(rate),
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, flexGrow: 0,
      borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    }}>
      <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.floor(size * 0.22), color: 'white', lineHeight: 1, display: 'flex' }}>SALE</span>
      <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: Math.floor(size * 0.32), color: 'white', lineHeight: 1.1, display: 'flex' }}>{rate}%</span>
    </div>
  );
}

// ─── 오른쪽 텍스트 정보 영역 ────────────────────────────
function ProductInfo({
  product, titleSize = 92, subtitleSize = 54, descSize = 48,
  chipSize = 56, priceSize = 100, badgeSize = 120,
  paddingTop = 100, paddingRight = 20, paddingBottom = 20, paddingLeft = 48,
  baseUrl
}: {
  product: ProductData; titleSize?: number; subtitleSize?: number; descSize?: number;
  chipSize?: number; priceSize?: number; badgeSize?: number;
  paddingTop?: number; paddingRight?: number; paddingBottom?: number; paddingLeft?: number;
  baseUrl?: string;
}) {
  const hasSale = product.discountRate > 0 && product.salePrice > 0;

  return (
    <div style={{
      flexGrow: 1, flexShrink: 1, flexBasis: 0,
      backgroundColor: 'white',
      position: 'relative',
      paddingTop, paddingRight, paddingBottom, paddingLeft,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {hasSale && (
        <div style={{ position: 'absolute', top: 0, right: paddingRight, display: 'flex' }}>
          <SaleBadge rate={product.discountRate} product={product} size={badgeSize} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: Math.floor(titleSize * 0.2), flexShrink: 0, flexGrow: 0 }}>
        <div style={{
          fontFamily: FONT, fontWeight: 800, fontSize: titleSize, color: TEXT_COLOR,
          lineHeight: 1.1, display: 'flex', flexDirection: 'column',
        }}>
          {product.name?.split('\n').map((line, i) => (
            <span key={i} style={{ display: 'flex', flexWrap: 'wrap' }}>{line}</span>
          ))}
        </div>
        <div style={{ display: 'flex' }}>
          <span style={{
            fontFamily: FONT, fontWeight: 700, fontSize: subtitleSize, color: TEXT_COLOR,
            lineHeight: 1.1, display: 'flex', flexDirection: 'column'
          }}>
            {product.subtitle?.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'flex', flexWrap: 'wrap' }}>{line}</span>
            ))}
          </span>
        </div>
      </div>

      {product.description !== '없음' ? (
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          flexGrow: 1, flexShrink: 1, flexBasis: 0,
          paddingTop: 30, paddingBottom: 10,
          overflow: 'hidden',
        }}>
          <span style={{
            fontFamily: FONT, fontWeight: 500, fontSize: descSize, color: '#666',
            lineHeight: 1.4, display: 'flex', flexDirection: 'column', wordBreak: 'keep-all', overflow: 'hidden'
          }}>
            {product.description?.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'flex', flexWrap: 'wrap' }}>{line}</span>
            ))}
          </span>
        </div>
      ) : (
        <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, display: 'flex' }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0, flexGrow: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', flexShrink: 1, flexGrow: 0, overflow: 'hidden' }}>
          {!(product.colors.length === 0 || product.colors.includes('없음') || product.colors.includes('이미지')) && (
            <ColorList colors={product.colors} chipSize={chipSize} base64ColorChips={product._base64ColorChips} />
          )}
        </div>
        <PriceSection product={product} fontSize={priceSize} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// A타입: 1984 × 602
// ═══════════════════════════════════════════════════════════
export function TypeAPreview({ product, baseUrl }: { product: ProductData; baseUrl?: string }) {
  const FRAME_PADDING = 50;
  const innerHeight = 602 - FRAME_PADDING * 2;

  return (
    <div style={{
      width: 1984, height: 602, display: 'flex', backgroundColor: '#fff',
      paddingTop: FRAME_PADDING, paddingRight: FRAME_PADDING,
      paddingBottom: FRAME_PADDING, paddingLeft: FRAME_PADDING,
      fontFamily: FONT,
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', flexGrow: 1, flexShrink: 1, flexBasis: 0, overflow: 'hidden' }}>
        <Thumbnail product={product} height={innerHeight} baseUrl={baseUrl} />
        <ProductInfo
          product={product}
          titleSize={72} subtitleSize={42} descSize={36}
          chipSize={52} priceSize={80} badgeSize={110}
          paddingTop={36} paddingBottom={10} paddingRight={16} paddingLeft={56}
          baseUrl={baseUrl}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// B타입: 1984 × 803
// ═══════════════════════════════════════════════════════════
export function TypeBPreview({ product, baseUrl }: { product: ProductData; baseUrl?: string }) {
  const FRAME_PADDING = 70;
  const innerHeight = 803 - FRAME_PADDING * 2;

  return (
    <div style={{
      width: 1984, height: 803, display: 'flex', backgroundColor: '#fff',
      paddingTop: FRAME_PADDING, paddingRight: FRAME_PADDING,
      paddingBottom: FRAME_PADDING, paddingLeft: FRAME_PADDING,
      fontFamily: FONT,
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', flexGrow: 1, flexShrink: 1, flexBasis: 0, overflow: 'hidden' }}>
        <Thumbnail product={product} height={innerHeight} baseUrl={baseUrl} />
        <ProductInfo
          product={product}
          titleSize={88} subtitleSize={52} descSize={44}
          chipSize={60} priceSize={96} badgeSize={130}
          paddingTop={50} paddingBottom={16} paddingRight={20} paddingLeft={72}
          baseUrl={baseUrl}
        />
      </div>
    </div>
  );
}
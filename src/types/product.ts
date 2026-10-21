export type Cafe24MatchStatus = 'pending' | 'matched' | 'unmatched' | 'manual';

// 비즈 종류 — 가격표에는 S → P → P+ 순으로 표시
export type BeadType = 'S' | 'P' | 'P+';
export const BEAD_ORDER: BeadType[] = ['S', 'P', 'P+'];
export const BEAD_LABELS: Record<BeadType, string> = {
  S: '스탠다드',
  P: '프리미엄',
  'P+': '프리미엄 플러스',
};

// 옵션별 가격 한 줄 — 비즈(S / P / P+)는 아이콘, 그 외 수치 옵션(예: 리필 비즈 0.4kg)은 label 글자로 표시
export interface BeadPrice {
  bead?: BeadType;
  label: string; // 엑셀 비즈(옵션) 칸 원문
  originalPrice: number;
  salePrice: number;
  discountRate: number;
}

export interface ProductData {
  name: string;
  subtitle: string;
  description: string;
  colors: string[]; // parsed from slash-separated string
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  // 비즈(옵션) 칸이 채워진 행들을 상품명으로 합친 결과 (비즈만 있으면 S → P → P+ 순, 수치 옵션은 엑셀 순서).
  // 옵션 없는 상품은 undefined. 이때 위의 정상가/할인가는 첫 옵션 값, 할인율은 옵션 중 최댓값 (SALE 배지·파일명용)
  beadPrices?: BeadPrice[];
  thumbnailImage: string; // FTP filename OR absolute cafe24 URL after lookup
  colorChipImage: string; // FTP filename
  cafe24MatchStatus?: Cafe24MatchStatus;
  cafe24ProductNo?: number;
  cafe24ProductName?: string;
  // 미리보기용 — 썸네일 로고 자리가 어두우면 true (흰 로고). 다운로드는 서버가 썸네일로 다시 판단
  logoWhite?: boolean;
  _base64Thumb?: string | null;
  _base64Logo?: string | null;
  _base64Badge?: string | null;
  _base64Circle?: string | null; // 원형 이미지 (lib/circleImages — 상품명으로 자동)
  _base64ColorChips?: (string | null)[];
}

export type ImageType = 'A' | 'B';

// A-type: 1984 × 803
// B-type: 1984 × 602
export const IMAGE_SPECS = {
  A: { width: 1984, height: 803 },
  B: { width: 1984, height: 602 },
} as const;

// 커스텀 사이즈: A·B 중 가로세로 비율이 더 가까운 디자인을 그린 뒤 비율 유지로 맞춤.
// 주로 쓰는 2055×673(3.05) → B(3.30) — A(2.47)로 맞추면 양옆이 약 200px 씩 비고 글자가 작아짐.
export function customBaseType(width: number, height: number): ImageType {
  const r = Math.log(width / height);
  const dA = Math.abs(r - Math.log(IMAGE_SPECS.A.width / IMAGE_SPECS.A.height));
  const dB = Math.abs(r - Math.log(IMAGE_SPECS.B.width / IMAGE_SPECS.B.height));
  return dA <= dB ? 'A' : 'B';
}

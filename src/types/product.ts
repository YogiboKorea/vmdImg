export type Cafe24MatchStatus = 'pending' | 'matched' | 'unmatched' | 'manual';

export interface ProductData {
  name: string;
  subtitle: string;
  description: string;
  colors: string[]; // parsed from slash-separated string
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  thumbnailImage: string; // FTP filename OR absolute cafe24 URL after lookup
  colorChipImage: string; // FTP filename
  cafe24MatchStatus?: Cafe24MatchStatus;
  cafe24ProductNo?: number;
  cafe24ProductName?: string;
  _base64Thumb?: string | null;
  _base64Logo?: string | null;
  _base64Badge?: string | null;
  _base64ColorChips?: (string | null)[];
}

export type ImageType = 'A' | 'B';

// A-type: 1984 × 803
// B-type: 1984 × 602
export const IMAGE_SPECS = {
  A: { width: 1984, height: 803 },
  B: { width: 1984, height: 602 },
} as const;

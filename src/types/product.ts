export interface ProductData {
  name: string;
  subtitle: string;
  description: string;
  colors: string[]; // parsed from slash-separated string
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  thumbnailImage: string; // FTP filename
  colorChipImage: string; // FTP filename
  _base64Thumb?: string | null;
  _base64Logo?: string | null;
  _base64Badge?: string | null;
  _base64ColorChips?: (string | null)[];
}

export type ImageType = 'A' | 'B';

// A-type: 1984 × 602
// B-type: 1984 × 803
export const IMAGE_SPECS = {
  A: { width: 1984, height: 602 },
  B: { width: 1984, height: 803 },
} as const;

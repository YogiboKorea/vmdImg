'use client';

import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { ProductData, BeadType, BeadPrice, BEAD_ORDER, BEAD_LABELS } from '@/types/product';

interface Props {
  onParsed: (products: ProductData[]) => void;
}

/**
 * 엑셀 컬럼 구조 (헤더명으로 위치 자동 감지):
 *   상품명 | 서브 타이틀 | 상품 설명 | 색상(슬래시 구분) | 비즈 | 정상가 | 할인가 | 할인율(%)
 *
 * 비즈 규칙 (비즈 열은 없어도 됨 — 기존 7열 엑셀 호환):
 *   비즈 칸이 채워진 행은 같은 상품명끼리 가격표 1장으로 합쳐짐 (S → P → P+ 가격 줄).
 *   비즈 칸에 0.4kg 처럼 숫자가 든 값을 쓰면 아이콘 대신 그 글자로 표시 (리필 비즈 등, 엑셀 순서 유지).
 *   서브타이틀/설명/색상은 그 상품의 첫 행에만 적어도 됨.
 *   비즈 칸이 빈 행은 기존처럼 1행 = 가격표 1장.
 *
 * 이미지 규칙 (FTP 폴백, /web/vmd/):
 *   썸네일: 상품명.jpg      (예: 라운드필로우.jpg) — Cafe24 매칭이 일치X일 때만 사용
 *   컬러칩: 색상명.jpg 복수  (예: 로즈핑크.jpg, 스위트오렌지.jpg ...)
 *   원형 이미지(리필 비즈): 엑셀 입력 없이 상품명으로 코드에서 넣음 (lib/circleImages)
 */

// 공백/괄호/특수문자 제거 후 lowercase — 헤더 매칭에 사용
function norm(s: string): string {
  return s.toLowerCase().replace(/[\s\-_/()[\]{}.,!?·•+~`'"%]/g, '');
}

function cell(row: unknown[], i: number): string {
  return String(row?.[i] ?? '').trim();
}

// 정규화된 헤더명 → ColumnKey 매핑
const HEADER_ALIASES: Record<string, keyof ColumnMap> = {
  '상품명': 'name', '제품명': 'name', 'productname': 'name',
  '서브타이틀': 'subtitle', '서브타이틀eng': 'subtitle', 'subtitle': 'subtitle', '영문': 'subtitle',
  '상품설명': 'description', '설명': 'description', 'description': 'description',
  '색상': 'colors', '색상목록': 'colors', '컬러': 'colors', 'colors': 'colors',
  '정상가': 'originalPrice', '판매가': 'originalPrice', 'price': 'originalPrice',
  '할인가': 'salePrice', 'saleprice': 'salePrice',
  '할인율': 'discountRate', 'discount': 'discountRate',
  '비즈': 'bead', '비즈종류': 'bead', '비즈타입': 'bead', '충전재': 'bead', 'bead': 'bead',
  '옵션': 'bead', '용량': 'bead', '중량': 'bead',
};

interface ColumnMap {
  name?: number;
  subtitle?: number;
  description?: number;
  colors?: number;
  bead?: number;
  originalPrice?: number;
  salePrice?: number;
  discountRate?: number;
}

// 공백 제거 + lowercase + 끝의 "비즈" 제거 후 매칭 ('+' 는 P / P+ 구분에 필요하므로 유지)
const BEAD_ALIASES: Record<string, BeadType> = {
  's': 'S', '스탠다드': 'S', 'standard': 'S',
  'p': 'P', '프리미엄': 'P', 'premium': 'P',
  'p+': 'P+', '프리미엄플러스': 'P+', '프리미엄+': 'P+', 'premiumplus': 'P+', 'premium+': 'P+',
};

function parseBead(raw: string): BeadType | undefined {
  return BEAD_ALIASES[raw.toLowerCase().replace(/\s+/g, '').replace(/비즈$/, '')];
}

// 같은 옵션 판단용 — 공백 무시, 소문자 (0.4 kg = 0.4kg)
function optionKey(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, '');
}

interface ParsedRow {
  product: ProductData;
  beadRaw: string; // 비즈(옵션) 칸 원문. 빈 문자열이면 옵션 없는 상품
}

// 헤더 행을 찾고 각 컬럼 위치를 매핑. 첫 5행 안에서 '상품명' 포함된 행을 헤더로 간주.
function detectHeader(rows: unknown[][]): { headerRowIdx: number; map: ColumnMap } | null {
  const scanLimit = Math.min(rows.length, 5);
  for (let r = 0; r < scanLimit; r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;
    const map: ColumnMap = {};
    let hasName = false;
    for (let c = 0; c < row.length; c++) {
      const key = HEADER_ALIASES[norm(String(row[c] ?? ''))];
      if (key && map[key] === undefined) {
        map[key] = c;
        if (key === 'name') hasName = true;
      }
    }
    if (hasName) return { headerRowIdx: r, map };
  }
  return null;
}

function parseRowWithMap(row: unknown[], map: ColumnMap): ParsedRow | null {
  if (!Array.isArray(row) || map.name === undefined) return null;
  const name = cell(row, map.name);
  if (!name) return null;

  const subtitle      = map.subtitle      !== undefined ? cell(row, map.subtitle)      : '';
  const description   = map.description   !== undefined ? cell(row, map.description)   : '';
  const colorsRaw     = map.colors        !== undefined ? cell(row, map.colors)        : '';
  const beadRaw       = map.bead          !== undefined ? cell(row, map.bead)          : '';
  const originalPrice = map.originalPrice !== undefined ? parseFloat(cell(row, map.originalPrice).replace(/[^0-9.]/g, '')) || 0 : 0;
  let salePrice       = map.salePrice     !== undefined ? parseFloat(cell(row, map.salePrice).replace(/[^0-9.]/g, '')) || 0 : 0;
  let discountRate    = map.discountRate  !== undefined ? parseFloat(cell(row, map.discountRate).replace(/[^0-9.]/g, '')) || 0 : 0;

  // 세 값 중 비어 있는 항목 보완: 정상가만 있으면 할인 표시가 안 나오므로 서로 계산해 채운다.
  if (discountRate <= 0 && originalPrice > 0 && salePrice > 0 && salePrice < originalPrice) {
    // 정상가 + 할인가 → 할인율 계산
    discountRate = Math.round((1 - salePrice / originalPrice) * 100);
  } else if (salePrice <= 0 && originalPrice > 0 && discountRate > 0) {
    // 정상가 + 할인율 → 할인가 계산
    salePrice = Math.round(originalPrice * (1 - discountRate / 100));
  }

  const colors = colorsRaw.split('/').map((c) => c.trim()).filter(Boolean);
  const thumbnailImage = name.replace(/\s+/g, '') + '.jpg';
  const colorChipImage = colors.map((c) => c.replace(/\s+/g, '') + '.jpg').join(',');

  return {
    product: { name, subtitle, description, colors, originalPrice, salePrice, discountRate, thumbnailImage, colorChipImage },
    beadRaw,
  };
}

/**
 * 비즈(옵션) 칸이 채워진 행을 상품명(공백 무시)별로 가격표 1장으로 합친다.
 *   - 비즈 값(스탠다드/프리미엄/프리미엄 플러스, S/P/P+)은 아이콘, 숫자가 든 값(리필 비즈 0.4kg 등)은 글자로 표시
 *   - 합쳐진 카드는 그 상품의 첫 행 위치에 놓이고, 상품명도 첫 행 표기를 따름
 *   - 서브타이틀/설명/색상은 그룹에서 처음 나오는 비어 있지 않은 값
 *   - 대표 정상가/할인가 = 첫 옵션 값, 할인율 = 옵션 중 최댓값
 * 인식 못 한 값(비즈 이름도 아니고 숫자도 없음)이나 같은 상품의 옵션 중복은 errors 로 반환.
 */
function mergeBeadRows(rows: ParsedRow[]): { products: ProductData[]; errors: string[] } {
  const products: ProductData[] = [];
  const errors: string[] = [];
  const cards = new Map<string, ProductData>(); // 공백 제거한 상품명 → products 안의 합쳐진 카드

  for (const { product, beadRaw } of rows) {
    if (!beadRaw) {
      products.push(product);
      continue;
    }
    const bead = parseBead(beadRaw);
    if (!bead && !/\d/.test(beadRaw)) {
      errors.push(`"${product.name}" 의 비즈 값 "${beadRaw}" 를 인식할 수 없습니다.`);
      continue;
    }
    const price: BeadPrice = {
      ...(bead ? { bead } : {}),
      label: beadRaw,
      originalPrice: product.originalPrice,
      salePrice: product.salePrice,
      discountRate: product.discountRate,
    };
    const key = product.name.replace(/\s+/g, '');
    const card = cards.get(key);
    if (!card) {
      const created = { ...product, beadPrices: [price] };
      cards.set(key, created);
      products.push(created);
      continue;
    }
    if (card.beadPrices!.some((b) => (bead ? b.bead === bead : !b.bead && optionKey(b.label) === optionKey(beadRaw)))) {
      errors.push(`"${product.name}" 에 ${bead ? BEAD_LABELS[bead] : beadRaw} 행이 2개 이상 있습니다.`);
      continue;
    }
    card.beadPrices!.push(price);
    if (!card.subtitle) card.subtitle = product.subtitle;
    if (!card.description) card.description = product.description;
    if (card.colors.length === 0) {
      card.colors = product.colors;
      card.colorChipImage = product.colorChipImage;
    }
  }

  for (const card of cards.values()) {
    const beads = card.beadPrices!;
    // 비즈만 있으면 S → P → P+ 순, 수치 옵션(0.4kg 등)이 섞이면 엑셀 순서 그대로
    if (beads.every((b) => b.bead)) {
      beads.sort((a, b) => BEAD_ORDER.indexOf(a.bead!) - BEAD_ORDER.indexOf(b.bead!));
    }
    card.originalPrice = beads[0].originalPrice;
    card.salePrice = beads[0].salePrice;
    card.discountRate = Math.max(...beads.map((b) => b.discountRate));
  }

  return { products, errors };
}

export default function ExcelUploader({ onParsed }: Props) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const processFile = useCallback(
    (file: File) => {
      setError('');
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          // blankrows:false 로 빈 행 제거. raw:true 로 셀 원본 값 (숫자는 number)
          const allRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
            header: 1,
            defval: '',
            blankrows: false,
            raw: true,
          });

          console.log('[VMD] 시트:', sheetName, '행 수:', allRows.length);
          console.log('[VMD] 헤더행:', JSON.stringify(allRows[0]));
          console.log('[VMD] 첫데이터행:', JSON.stringify(allRows[1]));

          // 헤더 행 + 컬럼 위치 자동 감지 (A열이 비어 있어도 OK)
          const detected = detectHeader(allRows as unknown[][]);
          if (!detected) {
            const head = allRows[0] ? JSON.stringify(allRows[0]) : '(empty)';
            const sample = allRows[1] ? JSON.stringify(allRows[1]) : '(empty)';
            setError(
              `헤더를 찾을 수 없습니다.\n시트: ${sheetName}, 행 수: ${allRows.length}\n` +
              `1행: ${head}\n2행: ${sample}\n` +
              `→ "상품명" 컬럼이 있는 행이 있는지 확인하세요.`
            );
            return;
          }

          console.log('[VMD] 헤더 위치:', detected.headerRowIdx, '컬럼 매핑:', detected.map);

          const dataRows = (allRows as unknown[][])
            .slice(detected.headerRowIdx + 1)
            .filter((row) => Array.isArray(row) && cell(row, detected.map.name!).length > 0);

          const rows = dataRows
            .map((row) => parseRowWithMap(row, detected.map))
            .filter(Boolean) as ParsedRow[];

          if (rows.length === 0) {
            setError(
              `헤더는 찾았지만 데이터 행이 없습니다.\n시트: ${sheetName}, 헤더 위치: ${detected.headerRowIdx + 1}행\n` +
              `상품명 컬럼: ${detected.map.name! + 1}열\n` +
              `→ 헤더 아래 행에 상품명 값이 있는지 확인하세요.`
            );
            return;
          }

          const { products, errors } = mergeBeadRows(rows);
          if (errors.length > 0) {
            setError(
              `비즈 칸을 확인해 주세요.\n${errors.join('\n')}\n` +
              `→ 비즈는 스탠다드 / 프리미엄 / 프리미엄 플러스 (또는 S / P / P+) 나 0.4kg 같은 용량으로 적고, 같은 상품에 같은 값은 한 번만 넣어 주세요.`
            );
            return;
          }
          console.log('[VMD] 파싱된 상품:', `${rows.length}행 → 가격표 ${products.length}장`, products[0]);
          onParsed(products);
        } catch (err) {
          console.error('Excel parse error:', err);
          setError('엑셀 파일 파싱에 실패했습니다: ' + (err instanceof Error ? err.message : String(err)));
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [onParsed]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full">
      <div
        className={`drop-zone rounded-2xl p-10 text-center cursor-pointer bg-white hover:bg-gray-50 transition-all ${dragging ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('excel-input')?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-base">
              {fileName || '엑셀 파일(.xlsx)을 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              상품명 / 서브타이틀 / 상품설명 / 색상(슬래시구분) / 비즈 / 정상가 / 할인가 / 할인율(%)
            </p>
          </div>
          {fileName && (
            <span className="badge mt-1">✓ {fileName}</span>
          )}
        </div>
        <input
          id="excel-input"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={onChange}
        />
      </div>
      {error && (
        <pre style={{
          marginTop: 12,
          padding: 12,
          background: '#FFF5F5',
          border: '1px solid #FCA5A5',
          borderRadius: 8,
          color: '#B91C1C',
          fontSize: 12,
          fontFamily: 'inherit',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          textAlign: 'left',
        }}>
          {error}
        </pre>
      )}
    </div>
  );
}

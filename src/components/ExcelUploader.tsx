'use client';

import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { ProductData } from '@/types/product';

interface Props {
  onParsed: (products: ProductData[]) => void;
}

/**
 * 엑셀 컬럼 구조 (A열부터, 빈 열 없음):
 * row[0]: 상품명         | row[1]: 서브 타이틀   | row[2]: 상품 설명
 * row[3]: 색상 목록(슬래시 구분) | row[4]: 정상가 | row[5]: 할인가 | row[6]: 할인율(%)
 *
 * 이미지 규칙 (FTP 폴백, /web/vmd/):
 *   썸네일: 상품명.jpg      (예: 라운드필로우.jpg) — Cafe24 매칭이 일치X일 때만 사용
 *   컬러칩: 색상명.jpg 복수  (예: 로즈핑크.jpg, 스위트오렌지.jpg ...)
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
};

interface ColumnMap {
  name?: number;
  subtitle?: number;
  description?: number;
  colors?: number;
  originalPrice?: number;
  salePrice?: number;
  discountRate?: number;
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

function parseRowWithMap(row: unknown[], map: ColumnMap): ProductData | null {
  if (!Array.isArray(row) || map.name === undefined) return null;
  const name = cell(row, map.name);
  if (!name) return null;

  const subtitle      = map.subtitle      !== undefined ? cell(row, map.subtitle)      : '';
  const description   = map.description   !== undefined ? cell(row, map.description)   : '';
  const colorsRaw     = map.colors        !== undefined ? cell(row, map.colors)        : '';
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

  return { name, subtitle, description, colors, originalPrice, salePrice, discountRate, thumbnailImage, colorChipImage };
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

          const products = dataRows
            .map((row) => parseRowWithMap(row, detected.map))
            .filter(Boolean) as ProductData[];
          console.log('[VMD] 파싱된 상품:', products.length, products[0]);

          if (products.length === 0) {
            setError(
              `헤더는 찾았지만 데이터 행이 없습니다.\n시트: ${sheetName}, 헤더 위치: ${detected.headerRowIdx + 1}행\n` +
              `상품명 컬럼: ${detected.map.name! + 1}열\n` +
              `→ 헤더 아래 행에 상품명 값이 있는지 확인하세요.`
            );
            return;
          }
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
              상품명 / 서브타이틀 / 상품설명 / 색상(슬래시구분) / 정상가 / 할인가 / 할인율(%)
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

'use client';

import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { ProductData } from '@/types/product';

interface Props {
  onParsed: (products: ProductData[]) => void;
}

/**
 * 실제 엑셀 컬럼 구조 (A열부터, 빈 열 없음):
 * row[0]: 상품명  | row[1]: 서브타이틀 | row[2]: 상품설명
 * row[3]: 색상(슬래시구분) | row[4]: 정상가 | row[5]: 할인가 | row[6]: 할인율(%)
 *
 * 이미지 규칙 (FTP /web/vmd/):
 *   썸네일: 상품명.jpg      (예: 라운드필로우.jpg)
 *   컬러칩: 색상명.jpg 복수  (예: 로즈핑크.jpg, 스위트오렌지.jpg ...)
 */
function parseRawRow(row: unknown[]): ProductData | null {
  if (!Array.isArray(row) || row.length < 4) return null;

  const name = String(row[0] ?? '').trim();
  if (!name || name === '상품명') return null; // 헤더 행 제외

  const subtitle      = String(row[1] ?? '').trim();
  const description   = String(row[2] ?? '').trim();
  const colorsRaw     = String(row[3] ?? '').trim();
  const originalPrice = parseFloat(String(row[4] ?? '0').replace(/[^0-9.]/g, '')) || 0;
  const salePrice     = parseFloat(String(row[5] ?? '0').replace(/[^0-9.]/g, '')) || 0;
  const discountRate  = parseFloat(String(row[6] ?? '0').replace(/[^0-9.]/g, '')) || 0;

  // 색상명을 슬래시로 분리 (공백 포함 그대로 보존)
  const colors = colorsRaw.split('/').map((c) => c.trim()).filter(Boolean);

  // 썸네일: 상품명.jpg (공백만 제거)
  const thumbnailImage = name.replace(/\s+/g, '') + '.jpg';

  // 컬러칩: "로즈핑크.jpg,스위트오렌지.jpg,..." (쉼표 구분, 각각 FTP에서 로드)
  const colorChipImage = colors.map((c) => c.replace(/\s+/g, '') + '.jpg').join(',');

  return {
    name,
    subtitle,
    description,
    colors,
    originalPrice,
    salePrice,
    discountRate,
    thumbnailImage,
    colorChipImage,
  };
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
          const sheet = workbook.Sheets[workbook.SheetNames[0]];

          const allRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
            header: 1,
            defval: '',
          });

          console.log('[VMD] 헤더행:', JSON.stringify(allRows[0]));
          console.log('[VMD] 첫데이터행:', JSON.stringify(allRows[1]));

          // 필터: row[0](상품명)이 비어있지 않은 행
          const dataRows = allRows.filter((row) => {
            if (!Array.isArray(row) || row.length < 1) return false;
            const name = String(row[0] ?? '').trim();
            return name.length > 0;
          });

          const products = dataRows.map(parseRawRow).filter(Boolean) as ProductData[];
          console.log('[VMD] 파싱된 상품:', products.length, products[0]);

          if (products.length === 0) {
            setError('파싱된 데이터가 없습니다. 엑셀 형식을 확인하세요.');
            return;
          }
          onParsed(products);
        } catch (err) {
          console.error('Excel parse error:', err);
          setError('엑셀 파일 파싱에 실패했습니다.');
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
        <p className="mt-3 text-red-500 text-sm font-medium text-center">{error}</p>
      )}
    </div>
  );
}

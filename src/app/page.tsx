'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelUploader from '@/components/ExcelUploader';
import { ProductData, IMAGE_SPECS } from '@/types/product';
import JSZip from 'jszip';

import { TypeAPreview, TypeBPreview, PriceCardCustom } from '@/components/ImagePreviews';
import Cafe24SearchModal from '@/components/Cafe24SearchModal';
import UsageGuide from '@/components/UsageGuide';
import { lookupManyByName } from '@/lib/cafe24Lookup';

/** 업로드 양식 xlsx 생성·다운로드 — 헤더 + 예시 2행 */
function downloadTemplate() {
  const headers = ['상품명', '서브 타이틀', '상품 설명', '색상', '정상가', '할인가', '할인율(%)'];
  const samples = [
    ['냅', 'NAP / 인체공학 목베개', '목을 부드럽게 감싸주고 포근함을 더해주는\n스냅 버튼으로 고정이 가능', '로즈 핑크/스위트 오렌지/올리브 그린/아쿠아 블루', 34800, 34800, 0],
    ['코지보', 'COZYBO / 사계절 담요', 'Yogibo만의 독자적인 섬유 엔지니어링 기술로 만들어진\n부드러운 소재감과 적당한 두께감의 사계절 담요', '체리 레드/아쿠아 블루/올리브 그린', 139000, 118150, 15],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...samples]);
  ws['!cols'] = [
    { width: 18 }, // 상품명
    { width: 28 }, // 서브 타이틀
    { width: 50 }, // 상품 설명
    { width: 36 }, // 색상
    { width: 12 }, // 정상가
    { width: 12 }, // 할인가
    { width: 10 }, // 할인율
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '가격표');
  XLSX.writeFile(wb, '가격표_업로드_양식.xlsx');
}

/** 컨테이너 ref의 실제 너비를 반환하는 hook */
function useContainerWidth() {
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  return { containerRef, width };
}

function ScaledPreview({ naturalWidth, naturalHeight, children }: { naturalWidth: number, naturalHeight: number, children: React.ReactNode }) {
  const { containerRef, width: containerWidth } = useContainerWidth();
  const scale = containerWidth ? containerWidth / naturalWidth : 1;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: containerWidth ? naturalHeight * scale : 'auto', overflow: 'hidden' }}>
      <div id={`scale-wrapper-${naturalHeight}`} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: naturalWidth, height: naturalHeight }}>
        <div style={{ width: naturalWidth, height: naturalHeight, backgroundColor: '#fff', display: 'flex' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function DownloadButton({
  label,
  color,
  loading,
  onClick,
  id,
}: {
  label: string;
  color: string;
  loading: boolean;
  onClick: () => void;
  id: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 24px',
        borderRadius: 12,
        fontWeight: 700,
        fontSize: 14,
        color: 'white',
        background: loading ? '#ccc' : color,
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
      }}
    >
      {loading ? (
        <>
          <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} fill="none" viewBox="0 0 24 24">
            <circle opacity={0.25} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path opacity={0.75} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
          </svg>
          생성중...
        </>
      ) : (
        <>
          <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [lookupProgress, setLookupProgress] = useState<{ done: number; total: number } | null>(null);
  const [modal, setModal] = useState<{ open: boolean; productName: string }>({ open: false, productName: '' });
  const [customW, setCustomW] = useState<number>(1984);
  const [customH, setCustomH] = useState<number>(700);

  const groupedNames = Array.from(new Set(products.map(p => p.name)));
  const currentName = groupedNames[selectedIndex] ?? null;
  const currentProducts = products.filter(p => p.name === currentName);

  const runLookup = useCallback(async (parsed: ProductData[]) => {
    const names = Array.from(new Set(parsed.map(p => p.name)));
    if (names.length === 0) return;
    setLookupProgress({ done: 0, total: names.length });
    try {
      const matches = await lookupManyByName(names, 5, (done, total) => {
        setLookupProgress({ done, total });
      });
      setProducts(prev => prev.map(p => {
        const m = matches.get(p.name);
        if (!m) return p;
        if (m.status === 'matched') {
          return {
            ...p,
            thumbnailImage: m.imageUrl || p.thumbnailImage,
            cafe24MatchStatus: 'matched',
            cafe24ProductNo: m.product.product_no,
            cafe24ProductName: m.product.product_name,
          };
        }
        return { ...p, cafe24MatchStatus: 'unmatched' };
      }));
    } finally {
      setLookupProgress(null);
    }
  }, []);

  const handleParsed = useCallback((data: ProductData[]) => {
    const tagged = data.map(p => ({ ...p, cafe24MatchStatus: 'pending' as const }));
    setProducts(tagged);
    setSelectedIndex(0);
    runLookup(tagged);
  }, [runLookup]);

  const handleManualPick = useCallback((picked: { productNo?: number; productName?: string; imageUrl: string }) => {
    const targetName = modal.productName;
    setProducts(prev => prev.map(p => p.name === targetName ? {
      ...p,
      thumbnailImage: picked.imageUrl,
      cafe24MatchStatus: 'manual',
      // 업로드 케이스 (productNo 없음) 에선 cafe24 정보 클리어
      cafe24ProductNo: picked.productNo,
      cafe24ProductName: picked.productName,
    } : p));
    setModal({ open: false, productName: '' });
  }, [modal.productName]);

  /**
   * 공용 다운로드 — targetProducts × variants 의 모든 조합을 한 ZIP 으로.
   *   - targetProducts 미지정 시 currentProducts (현재 선택 상품) 사용
   *   - targetProducts = products 로 넘기면 전체 상품 일괄 다운로드
   */
  const runDownload = useCallback(async (params: {
    busyKey: string;
    zipName: string;
    variants: { label: string; width: number; height: number; autoFit?: boolean; type?: 'A' | 'B' }[];
    targetProducts?: ProductData[];
  }) => {
    const targets = params.targetProducts ?? currentProducts;
    if (targets.length === 0) return;
    setDownloading(params.busyKey);
    try {
      const zip = new JSZip();
      for (const variant of params.variants) {
        for (const product of targets) {
          const res = await fetch('/api/generate-vmd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product, width: variant.width, height: variant.height,
              type: variant.type,
              autoFit: !!variant.autoFit,
            }),
          });
          if (!res.ok) {
            throw new Error('API Generate Failed: ' + await res.text());
          }
          const blob = await res.blob();
          const filename = `${product.name}_${product.discountRate}%할인_${variant.label}_${variant.width}x${variant.height}.png`;
          zip.file(filename, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${params.zipName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('이미지 생성 혹은 압축 중 오류가 발생했습니다.');
    } finally {
      setDownloading(null);
    }
  }, [currentProducts]);

  const handleDownload = useCallback((type: 'A' | 'B') => {
    const spec = IMAGE_SPECS[type];
    return runDownload({
      busyKey: type,
      zipName: `${currentName}_${type}타입_이미지모음`,
      variants: [{ label: `${type}타입`, width: spec.width, height: spec.height, type }],
    });
  }, [runDownload, currentName]);

  const handleDownloadAll = useCallback(() => {
    return runDownload({
      busyKey: 'ALL',
      zipName: `${currentName}_전체_AB타입_이미지모음`,
      variants: [
        { label: 'A타입', width: IMAGE_SPECS.A.width, height: IMAGE_SPECS.A.height, type: 'A' },
        { label: 'B타입', width: IMAGE_SPECS.B.width, height: IMAGE_SPECS.B.height, type: 'B' },
      ],
    });
  }, [runDownload, currentName]);

  const handleDownloadCustom = useCallback(() => {
    const w = Math.max(100, Math.min(10000, Math.round(customW || 0)));
    const h = Math.max(100, Math.min(10000, Math.round(customH || 0)));
    return runDownload({
      busyKey: 'CUSTOM',
      zipName: `${currentName}_커스텀_${w}x${h}`,
      variants: [{ label: '커스텀', width: w, height: h, autoFit: true }],
    });
  }, [runDownload, currentName, customW, customH]);

  // ─── 전체 상품 일괄 다운로드 (모든 옵션 × 모든 상품) ───
  const handleDownloadAllProductsA = useCallback(() => {
    return runDownload({
      busyKey: 'BULK_A',
      zipName: `전체상품_A타입_이미지모음`,
      variants: [{ label: 'A타입', width: IMAGE_SPECS.A.width, height: IMAGE_SPECS.A.height, type: 'A' }],
      targetProducts: products,
    });
  }, [runDownload, products]);

  const handleDownloadAllProductsB = useCallback(() => {
    return runDownload({
      busyKey: 'BULK_B',
      zipName: `전체상품_B타입_이미지모음`,
      variants: [{ label: 'B타입', width: IMAGE_SPECS.B.width, height: IMAGE_SPECS.B.height, type: 'B' }],
      targetProducts: products,
    });
  }, [runDownload, products]);

  const handleDownloadAllProductsCustom = useCallback(() => {
    const w = Math.max(100, Math.min(10000, Math.round(customW || 0)));
    const h = Math.max(100, Math.min(10000, Math.round(customH || 0)));
    return runDownload({
      busyKey: 'BULK_CUSTOM',
      zipName: `전체상품_커스텀_${w}x${h}`,
      variants: [{ label: '커스텀', width: w, height: h, autoFit: true }],
      targetProducts: products,
    });
  }, [runDownload, products, customW, customH]);

  return (
    <main className="min-h-screen" style={{ background: 'var(--yogibo-bg)' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-1.5px', color: '#111', fontFamily: 'Arial, sans-serif' }}>yogibo</span>
          <span style={{ width: 1, height: 20, background: '#ddd' }} />
          <span style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>가격표 이미지 자동생성기</span>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32, background: '#f4f4f4', minHeight: '100vh' }}>

        <UsageGuide />

        <section style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid #eee' }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 16, color: '#111', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8192C', color: 'white', fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                엑셀 파일 업로드
              </h2>
              <p style={{ marginTop: 6, marginLeft: 36, fontSize: 13, color: '#999' }}>
                상품명 · 서브타이틀 · 상품설명 · 색상(슬래시구분) · 정상가 · 할인가 · 할인율(%) 순으로 작성된 xlsx 파일
              </p>
            </div>
            <button
              type="button"
              onClick={downloadTemplate}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 10,
                fontWeight: 700, fontSize: 13,
                background: 'white', color: '#374151',
                border: '1.5px solid #E5E7EB',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E8192C'; e.currentTarget.style.color = '#E8192C'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}
              title="작성용 빈 양식 (헤더 + 예시 2행) 다운로드"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              양식 다운로드 (.xlsx)
            </button>
          </div>
          <ExcelUploader onParsed={handleParsed} />
          {lookupProgress && (
            <p style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
              Cafe24 썸네일 매칭 중... {lookupProgress.done} / {lookupProgress.total}
            </p>
          )}
        </section>

        {groupedNames.length > 0 && currentProducts.length > 0 && (
          <>
            <section style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <h2 style={{ fontWeight: 800, fontSize: 16, color: '#111', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8192C', color: 'white', fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                  상품 선택 <span style={{ fontWeight: 500, color: '#999', fontSize: 14 }}>({groupedNames.length}개 상품, 총 {products.length}개 옵션 인식됨)</span>
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#666', fontWeight: 700, marginRight: 4 }}>전체 이미지 다운받기</span>
                  <DownloadButton id="bulk-a" label="A타입" color="#E8192C" loading={downloading === 'BULK_A'} onClick={handleDownloadAllProductsA} />
                  <DownloadButton id="bulk-b" label="B타입" color="#111827" loading={downloading === 'BULK_B'} onClick={handleDownloadAllProductsB} />
                  <DownloadButton id="bulk-custom" label="커스텀" color="#6D28D9" loading={downloading === 'BULK_CUSTOM'} onClick={handleDownloadAllProductsCustom} />
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {groupedNames.map((name, i) => {
                  const sample = products.find(p => p.name === name);
                  const status = sample?.cafe24MatchStatus ?? 'pending';
                  const isSelected = selectedIndex === i;
                  const chipColor =
                    status === 'matched' ? { bg: '#E8F5E9', color: '#2E7D32', label: '일치' } :
                    status === 'manual'  ? { bg: '#E3F2FD', color: '#1565C0', label: '수동' } :
                    status === 'unmatched' ? { bg: '#FFEBEE', color: '#C62828', label: '일치X' } :
                                             { bg: '#F3F4F6', color: '#6B7280', label: '확인중' };
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(i)}
                      onDoubleClick={() => setModal({ open: true, productName: name })}
                      title="더블클릭하여 Cafe24 검색 또는 이미지 직접 업로드"
                      style={{
                        padding: '8px 12px 8px 18px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 13,
                        border: `1.5px solid ${isSelected ? '#E8192C' : '#E5E7EB'}`,
                        background: isSelected ? '#E8192C' : 'white',
                        color: isSelected ? 'white' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span>{name}</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        background: isSelected ? 'rgba(255,255,255,0.25)' : chipColor.bg,
                        color: isSelected ? 'white' : chipColor.color,
                      }}>
                        {chipColor.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
                ※ 상품을 더블클릭하면 Cafe24 검색 또는 이미지 직접 업로드로 썸네일을 교체할 수 있습니다.
              </p>
            </section>

            <section style={{ background: '#f7f7f7', borderRadius: 20, padding: '32px 32px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 28px' }}>
                <h2 style={{ fontWeight: 800, fontSize: 16, color: '#111', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8192C', color: 'white', fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                  미리보기 &amp; 다운로드
                </h2>
                <DownloadButton
                  id="download-all"
                  label="전체 (A+B) 다운로드"
                  color="#16A34A"
                  loading={downloading === 'ALL'}
                  onClick={handleDownloadAll}
                />
              </div>

              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#111' }}>A타입</span>
                    <span style={{ marginLeft: 8, fontSize: 13, color: '#aaa' }}>1984 × 803 px</span>
                  </div>
                  <DownloadButton id="download-a" label="A타입 다운로드" color="#E8192C" loading={downloading === 'A'} onClick={() => handleDownload('A')} />
                </div>
                <div style={{ background: '#fff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                    {currentProducts.map((prod, idx) => (
                      <ScaledPreview key={idx} naturalWidth={1984} naturalHeight={803}>
                        <TypeAPreview product={prod} />
                      </ScaledPreview>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#111' }}>B타입</span>
                    <span style={{ marginLeft: 8, fontSize: 13, color: '#aaa' }}>1984 × 602 px</span>
                  </div>
                  <DownloadButton id="download-b" label="B타입 다운로드" color="#111827" loading={downloading === 'B'} onClick={() => handleDownload('B')} />
                </div>
                <div style={{ background: '#fff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                    {currentProducts.map((prod, idx) => (
                      <ScaledPreview key={idx} naturalWidth={1984} naturalHeight={602}>
                        <TypeBPreview product={prod} />
                      </ScaledPreview>
                    ))}
                  </div>
                </div>
              </div>

              {/* 커스텀 사이즈 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#111' }}>커스텀 사이즈</span>
                    <span style={{ fontSize: 13, color: '#aaa' }}>(px 직접 입력)</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                      W
                      <input
                        type="number"
                        min={100}
                        max={10000}
                        step={1}
                        value={customW}
                        onChange={(e) => setCustomW(parseInt(e.target.value || '0', 10))}
                        style={{ width: 90, padding: '6px 8px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13 }}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                      H
                      <input
                        type="number"
                        min={100}
                        max={10000}
                        step={1}
                        value={customH}
                        onChange={(e) => setCustomH(parseInt(e.target.value || '0', 10))}
                        style={{ width: 90, padding: '6px 8px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13 }}
                      />
                    </label>
                  </div>
                  <DownloadButton
                    id="download-custom"
                    label="커스텀 다운로드"
                    color="#6D28D9"
                    loading={downloading === 'CUSTOM'}
                    onClick={handleDownloadCustom}
                  />
                </div>
                <div style={{ background: '#fff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                    {customW >= 100 && customH >= 100 && currentProducts.map((prod, idx) => (
                      <ScaledPreview key={idx} naturalWidth={customW} naturalHeight={customH}>
                        <PriceCardCustom product={prod} width={customW} height={customH} />
                      </ScaledPreview>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {products.length === 0 && (
          <div style={{ textAlign: 'center', color: '#bbb', padding: '60px 0', fontSize: 14 }}>
            엑셀 파일을 업로드하면 미리보기가 표시됩니다.
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <Cafe24SearchModal
        open={modal.open}
        initialQuery={modal.productName}
        onClose={() => setModal({ open: false, productName: '' })}
        onPick={handleManualPick}
      />
    </main>
  );
}
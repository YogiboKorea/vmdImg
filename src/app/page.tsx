'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ExcelUploader from '@/components/ExcelUploader';
import { ProductData, IMAGE_SPECS } from '@/types/product';
import JSZip from 'jszip';

import { TypeAPreview, TypeBPreview } from '@/components/ImagePreviews';

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
  const [downloading, setDownloading] = useState<'A' | 'B' | null>(null);

  const groupedNames = Array.from(new Set(products.map(p => p.name)));
  const currentName = groupedNames[selectedIndex] ?? null;
  const currentProducts = products.filter(p => p.name === currentName);

  const handleDownload = useCallback(async (type: 'A' | 'B') => {
    if (currentProducts.length === 0) return;
    setDownloading(type);
    try {
      const spec = IMAGE_SPECS[type];
      const zip = new JSZip();

      for (const product of currentProducts) {
        const res = await fetch('/api/generate-vmd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product, type }),
        });

        if (!res.ok) {
          throw new Error('API Generate Failed: ' + await res.text());
        }

        const blob = await res.blob();
        const filename = `${product.name}_${product.discountRate}%할인_${type}타입_${spec.width}x${spec.height}.png`;
        zip.file(filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentName}_${type}타입_이미지모음.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Download error:', err);
      alert('이미지 생성에 다운로드 혹은 압축 중 오류가 발생했습니다.');
    } finally {
      setDownloading(null);
    }
  }, [currentProducts, currentName]);

  return (
    <main className="min-h-screen" style={{ background: 'var(--yogibo-bg)' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-1.5px', color: '#111', fontFamily: 'Arial, sans-serif' }}>yogibo</span>
          <span style={{ width: 1, height: 20, background: '#ddd' }} />
          <span style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>VMD 이미지 자동생성기</span>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32, background: '#f4f4f4', minHeight: '100vh' }}>

        <section style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid #eee' }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, fontSize: 16, color: '#111', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8192C', color: 'white', fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
              엑셀 파일 업로드
            </h2>
            <p style={{ marginTop: 6, marginLeft: 36, fontSize: 13, color: '#999' }}>
              상품명 · 서브타이틀 · 상품설명 · 색상(슬래시구분) · 정상가 · 할인가 · 할인율(%) 순으로 작성된 xlsx 파일
            </p>
          </div>
          <ExcelUploader onParsed={(data) => { setProducts(data); setSelectedIndex(0); }} />
        </section>

        {groupedNames.length > 0 && currentProducts.length > 0 && (
          <>
            <section style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid #eee' }}>
              <h2 style={{ fontWeight: 800, fontSize: 16, color: '#111', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8192C', color: 'white', fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                상품 선택 <span style={{ fontWeight: 500, color: '#999', fontSize: 14 }}>({groupedNames.length}개 상품, 총 {products.length}개 옵션 인식됨)</span>
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {groupedNames.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      border: `1.5px solid ${selectedIndex === i ? '#E8192C' : '#E5E7EB'}`,
                      background: selectedIndex === i ? '#E8192C' : 'white',
                      color: selectedIndex === i ? 'white' : '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </section>

            <section style={{ background: '#f7f7f7', borderRadius: 20, padding: '32px 32px', border: '1px solid #eee' }}>
              <h2 style={{ fontWeight: 800, fontSize: 16, color: '#111', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 28px' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8192C', color: 'white', fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                미리보기 &amp; 다운로드
              </h2>

              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#111' }}>A타입</span>
                    <span style={{ marginLeft: 8, fontSize: 13, color: '#aaa' }}>1984 × 602 px</span>
                  </div>
                  <DownloadButton id="download-a" label="A타입 다운로드" color="#E8192C" loading={downloading === 'A'} onClick={() => handleDownload('A')} />
                </div>
                <div style={{ background: '#fff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                    {currentProducts.map((prod, idx) => (
                      <ScaledPreview key={idx} naturalWidth={1984} naturalHeight={602}>
                        <TypeAPreview product={prod} />
                      </ScaledPreview>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#111' }}>B타입</span>
                    <span style={{ marginLeft: 8, fontSize: 13, color: '#aaa' }}>1984 × 803 px</span>
                  </div>
                  <DownloadButton id="download-b" label="B타입 다운로드" color="#111827" loading={downloading === 'B'} onClick={() => handleDownload('B')} />
                </div>
                <div style={{ background: '#fff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                    {currentProducts.map((prod, idx) => (
                      <ScaledPreview key={idx} naturalWidth={1984} naturalHeight={803}>
                        <TypeBPreview product={prod} />
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
    </main>
  );
}
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Cafe24Product, searchProducts, getProductDetail } from '@/lib/cafe24Lookup';

interface Props {
  open: boolean;
  initialQuery: string;
  onClose: () => void;
  /**
   * productNo / productName 은 cafe24 검색에서 픽한 경우만 채워짐.
   * 로컬 파일 업로드 시엔 imageUrl 만 (data URL) 채워짐.
   */
  onPick: (picked: { productNo?: number; productName?: string; imageUrl: string }) => void;
}

// 파일 → data URL (base64) 변환
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Cafe24SearchModal({ open, initialQuery, onClose, onPick }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Cafe24Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState<number | null>(null);
  const [error, setError] = useState('');
  const debounceRef = useRef<number | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
  }, [open, initialQuery]);

  const runSearch = useCallback(async (q: string) => {
    const myId = ++reqIdRef.current;
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const list = await searchProducts(q.trim(), 30);
      if (myId !== reqIdRef.current) return;
      setResults(list);
    } catch (e) {
      if (myId !== reqIdRef.current) return;
      setError(e instanceof Error ? e.message : '검색 실패');
      setResults([]);
    } finally {
      if (myId === reqIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => runSearch(query), 300);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [query, open, runSearch]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handlePick = async (prod: Cafe24Product) => {
    setPicking(prod.product_no);
    try {
      // /products/all 응답에 detail_image가 이미 포함되어 있으면 단건 조회 생략
      let imageUrl = prod.detail_image || prod.image_medium || prod.list_image || '';
      if (!imageUrl) {
        const detail = await getProductDetail(prod.product_no).catch(() => null);
        imageUrl = detail?.detail_image || detail?.list_image || '';
      }
      if (!imageUrl) {
        setError('이 상품은 등록된 이미지가 없습니다.');
        return;
      }
      onPick({ productNo: prod.product_no, productName: prod.product_name, imageUrl });
    } finally {
      setPicking(null);
    }
  };

  // 로컬 이미지 업로드 — 파일을 base64 data URL 로 변환 후 onPick
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setError('파일 크기가 10MB 를 초과합니다.');
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onPick({ imageUrl: dataUrl });
    } catch (e) {
      setError('파일 읽기 실패: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setUploading(false);
    }
  }, [onPick]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 16, width: 'min(820px, 92vw)',
          maxHeight: '86vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
        }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong style={{ fontSize: 15, color: '#111' }}>Cafe24 썸네일 검색</strong>
          <span style={{ fontSize: 12, color: '#999' }}>상품명을 검색해서 클릭하세요</span>
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div style={{ padding: '14px 22px', borderBottom: '1px solid #f4f4f4' }}>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cafe24 상품명 검색"
            style={{
              width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10,
              fontSize: 14, outline: 'none',
            }}
          />

          {/* 로컬 이미지 직접 업로드 */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginTop: 10, padding: '12px 14px',
              border: `1.5px dashed ${dragOver ? '#E8192C' : '#E5E7EB'}`,
              background: dragOver ? '#FFF5F5' : '#FAFAFA',
              borderRadius: 10, cursor: uploading ? 'wait' : 'pointer',
              fontSize: 13, color: '#374151',
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.15s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span style={{ flex: 1 }}>
              {uploading ? '업로드 중...' : '이미지 파일 직접 업로드 (드래그 또는 클릭 / JPG·PNG·WEBP, 10MB 이하)'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              aria-label="썸네일 이미지 업로드"
              title="썸네일 이미지 업로드"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                // 같은 파일 재선택 가능하도록 초기화
                e.target.value = '';
              }}
            />
          </div>

          {error && <p style={{ color: '#E8192C', fontSize: 12, marginTop: 8 }}>{error}</p>}
        </div>

        <div style={{ overflowY: 'auto', padding: 16, flex: 1, minHeight: 200 }}>
          {loading && <p style={{ color: '#999', fontSize: 13 }}>검색 중...</p>}
          {!loading && results.length === 0 && query.trim() && (
            <p style={{ color: '#999', fontSize: 13 }}>검색 결과가 없습니다.</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {results.map((p) => {
              const isPicking = picking === p.product_no;
              return (
                <button
                  key={p.product_no}
                  onClick={() => handlePick(p)}
                  disabled={isPicking}
                  style={{
                    background: 'white', border: '1.5px solid #E5E7EB', borderRadius: 12,
                    padding: 10, cursor: isPicking ? 'wait' : 'pointer', textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: 8,
                    opacity: isPicking ? 0.6 : 1, transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#E8192C')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                >
                  <div style={{ width: '100%', aspectRatio: '1 / 1', background: '#f5f5f5', borderRadius: 8, overflow: 'hidden' }}>
                    {p.list_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.list_image}
                        alt={p.product_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 12 }}>
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#374151', fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.product_name}
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>#{p.product_no}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

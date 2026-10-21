'use client';

import { useState } from 'react';
import { IMAGE_CHIP_NAMES, IMAGE_CHIP_BASE } from './ImagePreviews';

// 매칭 상태 칩 미리보기 (실제 UI 와 동일한 스타일)
function StatusChip({ bg, color, label }: { bg: string; color: string; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, background: bg, color,
    }}>{label}</span>
  );
}

// 실제 상품 칩 미리보기 (이름 + 상태)
function ProductChipMock({ name, status }: { name: string; status: 'matched' | 'unmatched' | 'manual' | 'pending' }) {
  const chip =
    status === 'matched' ? { bg: '#E8F5E9', color: '#2E7D32', label: '일치' } :
    status === 'manual'  ? { bg: '#E3F2FD', color: '#1565C0', label: '수동' } :
    status === 'unmatched' ? { bg: '#FFEBEE', color: '#C62828', label: '일치X' } :
                             { bg: '#F3F4F6', color: '#6B7280', label: '확인중' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 12px 8px 18px', borderRadius: 10,
      fontWeight: 700, fontSize: 13,
      border: '1.5px solid #E5E7EB', background: 'white', color: '#374151',
    }}>
      <span>{name}</span>
      <StatusChip bg={chip.bg} color={chip.color} label={chip.label} />
    </span>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{
        flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
        background: '#E8192C', color: 'white', fontWeight: 900, fontSize: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{n}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FAFAFA', borderRadius: 12, padding: 18, border: '1px solid #EEE' }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111', margin: '0 0 14px' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

export default function UsageGuide() {
  const [open, setOpen] = useState(false);

  // 이미지 컬러칩 시리즈별 그룹핑 (prefix 기준)
  const groups: Record<string, string[]> = {};
  for (const name of IMAGE_CHIP_NAMES) {
    const prefix =
      name.startsWith('스퀴지보_하트') ? '스퀴지보 하트' :
      name.startsWith('스퀴지보_애니멀') ? '스퀴지보 애니멀' :
      name.startsWith('스퀴지보_플랜트') ? '스퀴지보 플랜트' :
      name.startsWith('메이트_필로우') ? '메이트 필로우' :
      name.startsWith('메이트_플랜트') ? '메이트 플랜트' :
      name.startsWith('롤메이트') ? '롤메이트' :
      name.startsWith('하트필로우') ? '하트필로우' :
      name === '레인보우' || name === '뉴트랄' ? '레인보우 · 뉴트럴' :
      '메이트';
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(name);
  }

  return (
    <section style={{ background: 'white', borderRadius: 20, padding: 0, border: '1px solid #eee', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '18px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: open ? '#FFF5F5' : 'white',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          transition: 'background 0.15s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8192C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>사용 설명서</span>
          <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>
            엑셀 형식 · Cafe24 매칭 · 컬러칩 · 다운로드
          </span>
        </span>
        <span style={{
          fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {open ? '접기' : '펼치기'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open && (
        <div style={{ padding: 24, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 18, borderTop: '1px solid #f0f0f0' }}>

          {/* 1. 엑셀 파일 형식 */}
          <Section title="① 엑셀 파일 형식">
            <Step n={1} title="컬럼 순서 (헤더 자동 감지)">
              아래 8개 컬럼이 한 줄에 있어야 합니다. <b>A열이 비어있어도</b> 헤더에 &quot;상품명&quot; 이 있는 행을 자동 인식합니다.
              <div style={{
                marginTop: 8, padding: 10, background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
                fontSize: 12, color: '#374151', overflowX: 'auto', whiteSpace: 'nowrap',
              }}>
                <code>상품명</code> · <code>서브 타이틀</code> · <code>상품 설명</code> · <code>색상(슬래시 / 로 구분)</code> · <code>비즈</code> · <code>정상가</code> · <code>할인가</code> · <code>할인율(%)</code>
              </div>
            </Step>
            <Step n={2} title="색상 컬럼 작성">
              여러 색상은 슬래시 <code>/</code> 로 구분합니다. 예시:
              <div style={{
                marginTop: 8, padding: 10, background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
                fontSize: 12, color: '#374151',
              }}>
                <code>로즈 핑크 / 스위트 오렌지 / 올리브 그린 / 아쿠아 블루</code>
              </div>
            </Step>
            <Step n={3} title="비즈 컬럼 작성 — 비즈별 가격을 가격표 1장으로">
              비즈마다 한 행씩 쓰고 <b>상품명을 똑같이</b> 적으면 가격표 1장에 S · P · P+ 가격 줄로 합쳐집니다.
              서브타이틀 · 상품설명 · 색상은 첫 행에만 적어도 됩니다.
              <div style={{
                marginTop: 8, padding: 10, background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
                fontSize: 12, color: '#374151', overflowX: 'auto', whiteSpace: 'nowrap', lineHeight: 1.8,
              }}>
                <code>카터필러 롤 맥스</code> · … · <code>스탠다드</code> · <code>199000</code> · <code>179100</code> · <code>10</code><br />
                <code>카터필러 롤 맥스</code> · (빈칸) · <code>프리미엄</code> · <code>299000</code> · <code>269100</code> · <code>10</code><br />
                <code>카터필러 롤 맥스</code> · (빈칸) · <code>프리미엄 플러스</code> · <code>399000</code> · <code>359100</code> · <code>10</code>
              </div>
              <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
                <li>비즈 값: <code>스탠다드</code> / <code>프리미엄</code> / <code>프리미엄 플러스</code> (또는 <code>S</code> / <code>P</code> / <code>P+</code>)</li>
                <li>비즈가 없는 상품(냅, 코지보 등)은 비즈 칸을 비워 두면 기존처럼 가격 1줄로 나옵니다.</li>
                <li>비즈별 할인율이 다르면 SALE 배지에는 가장 큰 할인율이 표시됩니다.</li>
                <li>리필 비즈처럼 용량이 옵션이면 비즈 칸에 <code>0.4kg</code> / <code>0.75kg</code> 처럼 숫자로 적으면 아이콘 대신 그 글자로 표시됩니다 (엑셀 순서대로).</li>
              </ul>
            </Step>
            <Step n={4} title="원형 이미지 — 리필 비즈 자동">
              상품명이 <b>스탠다드 리필 비즈 · 프리미엄 리필 비즈</b>이면 엑셀에 따로 적지 않아도
              썸네일 오른쪽 위에 비즈 원형 이미지가 자동으로 들어갑니다 (컬러칩 이미지처럼 상품명으로 인식).
            </Step>
          </Section>

          {/* 2. Cafe24 자동 매칭 */}
          <Section title="② Cafe24 자동 썸네일 매칭">
            <Step n={1} title="자동 매핑 동작">
              엑셀 업로드 후 상품명을 <b>정규화 매칭</b>(공백·특수문자·괄호 제거) 해서 Cafe24 등록 상품의 <code>detail_image</code> 를 자동으로 가져옵니다.
            </Step>
            <Step n={2} title="매칭 상태 칩 의미">
              상품 선택 영역의 각 칩 우측에 매칭 결과가 표시됩니다.
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                <ProductChipMock name="냅" status="matched" />
                <ProductChipMock name="코지보" status="manual" />
                <ProductChipMock name="신상품" status="unmatched" />
                <ProductChipMock name="확인중" status="pending" />
              </div>
              <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
                <li><b style={{ color: '#2E7D32' }}>일치</b> — Cafe24 에서 같은 이름 상품 찾음</li>
                <li><b style={{ color: '#1565C0' }}>수동</b> — 사용자가 직접 교체</li>
                <li><b style={{ color: '#C62828' }}>일치X</b> — Cafe24 에 없거나 매칭 실패. 더블클릭으로 직접 지정 필요</li>
                <li><b style={{ color: '#6B7280' }}>확인중</b> — 매칭 진행 중</li>
              </ul>
            </Step>
            <Step n={3} title="썸네일 수동 교체 — 모든 상태에서 가능">
              상품 칩을 <b>더블클릭</b> 하면 모달이 열립니다. 거기서:
              <ul style={{ marginTop: 6, paddingLeft: 18, lineHeight: 1.7 }}>
                <li>Cafe24 에서 다른 상품 검색 → 클릭으로 교체</li>
                <li>로컬 이미지 파일 드래그·업로드 (JPG/PNG/WEBP, 10MB 이하)</li>
              </ul>
              교체 후 상태는 <b style={{ color: '#1565C0' }}>수동</b> 으로 표시됩니다.
            </Step>
          </Section>

          {/* 3. 컬러칩 종류 */}
          <Section title="③ 컬러칩 — 솔리드 vs 이미지">
            <Step n={1} title="솔리드 컬러 (단색 원)">
              일반 컬러명은 자동으로 색상이 매핑됩니다.
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, alignItems: 'center' }}>
                {[
                  { name: '체리 레드', color: '#D80C1E' },
                  { name: '아쿠아 블루', color: '#0081CC' },
                  { name: '올리브 그린', color: '#79A02F' },
                  { name: '다크 그레이', color: '#615F5F' },
                  { name: '라이트 그레이', color: '#E5DED3' },
                ].map(c => (
                  <span key={c.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#444' }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: c.color }} />
                    {c.name}
                  </span>
                ))}
                <span style={{ fontSize: 12, color: '#999' }}>… 외 다수</span>
              </div>
            </Step>
            <Step n={2} title="이미지 컬러칩 (캐릭터·시리즈)">
              <span style={{ background: '#FFF3CD', color: '#856404', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>중요</span>
              {' '}이미지 컬러칩은 엑셀 색상 컬럼에 <b>아래 정확한 이름</b>으로 입력해야 자동 인식됩니다.<br />
              매핑된 이미지는 <code>{IMAGE_CHIP_BASE}/{'{'}이름{'}'}.png</code> 에서 자동 로드됩니다.
            </Step>
            <Step n={3} title="사용 가능한 이미지 컬러칩 이름">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
                {Object.entries(groups).map(([groupName, names]) => (
                  <div key={groupName}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#E8192C', marginBottom: 6 }}>
                      {groupName} <span style={{ color: '#999', fontWeight: 500 }}>({names.length}개)</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {names.map(n => (
                        <code key={n} style={{
                          padding: '4px 8px', background: 'white', border: '1px solid #E5E7EB',
                          borderRadius: 6, fontSize: 11, color: '#374151', fontFamily: 'monospace',
                        }}>{n}</code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Step>
          </Section>

          {/* 4. 다운로드 방식 */}
          <Section title="④ 다운로드 방식">
            <Step n={1} title="단일 상품 다운로드 (섹션 3 하단)">
              상품 하나를 선택하고 미리보기 확인 후:
              <ul style={{ marginTop: 6, paddingLeft: 18, lineHeight: 1.7 }}>
                <li><b style={{ color: '#E8192C' }}>A타입</b> — 1984×803 PNG</li>
                <li><b style={{ color: '#111827' }}>B타입</b> — 1984×602 PNG</li>
                <li><b style={{ color: '#16A34A' }}>전체 (A+B)</b> — 두 타입 한 번에</li>
                <li><b style={{ color: '#6D28D9' }}>커스텀</b> — W/H 직접 입력. 비율이 가까운 A·B타입 디자인을 골라 비율 유지하며 맞춤 (예: 2055×673 → B타입)</li>
              </ul>
            </Step>
            <Step n={2} title="전체 상품 일괄 다운로드 (섹션 2 헤더 우측)">
              엑셀에 있는 <b>모든 상품 × 모든 옵션</b>을 한 ZIP 으로:
              <ul style={{ marginTop: 6, paddingLeft: 18, lineHeight: 1.7 }}>
                <li><b style={{ color: '#E8192C' }}>A타입</b> 버튼 — 전체 상품 A타입</li>
                <li><b style={{ color: '#111827' }}>B타입</b> 버튼 — 전체 상품 B타입</li>
                <li><b style={{ color: '#6D28D9' }}>커스텀</b> 버튼 — 전체 상품 + 커스텀 사이즈</li>
              </ul>
              상품 수 × 옵션 수가 많으면 시간이 좀 걸립니다 (각 PNG 별도 생성).
            </Step>
          </Section>

        </div>
      )}
    </section>
  );
}

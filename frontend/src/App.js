import React, { useState, useEffect, useMemo } from 'react';
import { getAll, create, update } from './api';
import Apple from './Apple';
import './App.css';

const ROWS_PER_NOTE = 7;
const APPLE_MAX = 10;

// 크레파스 선 생성
function crayonLine(x1, y1, x2, y2, seed, color = '#c8c4e0') {
  const rand = (() => {
    let s = seed * 9301 + 49297;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  })();

  const lines = [];
  for (let i = 0; i < 3; i++) {
    const wobble = 1.5;
    const mx = (x1 + x2) / 2 + (rand() - 0.5) * wobble;
    const my = (y1 + y2) / 2 + (rand() - 0.5) * wobble;
    lines.push(
      <path
        key={i}
        d={`M ${x1 + (rand()-0.5)*wobble} ${y1 + (rand()-0.5)*wobble} Q ${mx} ${my} ${x2 + (rand()-0.5)*wobble} ${y2 + (rand()-0.5)*wobble}`}
        stroke={color}
        strokeWidth={0.8 + rand() * 0.8}
        strokeOpacity={0.35 + rand() * 0.3}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  return lines;
}

function CrayonButton({ onClick, disabled, children }) {
  const isLeft = children === '◀';

  const strokes = useMemo(() => {
    const rand = (() => {
      let s = (isLeft ? 1 : 2) * 9301 + 49297;
      return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    })();
    return Array.from({ length: 60 }).map(() => {
      const angle = rand() * Math.PI * 2;
      const dist = rand() * 13;
      const x = 18 + Math.cos(angle) * dist;
      const y = 18 + Math.sin(angle) * dist;
      const len = 2 + rand() * 4;
      const dx = Math.cos(rand() * Math.PI * 2) * len;
      const dy = Math.sin(rand() * Math.PI * 2) * len;
      return { x1: x, y1: y, x2: x + dx, y2: y + dy, op: 0.3 + rand() * 0.4, w: 0.8 + rand() * 1.2 };
    });
  }, [isLeft]);

  return (
    <div
      className={`crayon-btn ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? null : onClick}
    >
      <svg width="36" height="36" viewBox="0 0 36 36">
        <defs>
          <clipPath id={`btn-clip-${isLeft ? 'l' : 'r'}`}>
            <circle cx="18" cy="18" r="15" />
          </clipPath>
        </defs>
        {/* 원 테두리 크레파스 */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const nextAngle = ((i + 1) / 24) * Math.PI * 2;
          const seed = (isLeft ? 100 : 200) + i;
          return crayonLine(
            18 + Math.cos(angle) * 14, 18 + Math.sin(angle) * 14,
            18 + Math.cos(nextAngle) * 14, 18 + Math.sin(nextAngle) * 14,
            seed, '#c8b8f0'
          );
        })}
        {/* 호버 효과 — CSS .crayon-btn:hover 로 제어 */}
        <g clipPath={`url(#btn-clip-${isLeft ? 'l' : 'r'})`} className="btn-hover-strokes">
          {strokes.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
              stroke="#a090e0" strokeWidth={s.w} strokeOpacity={s.op} strokeLinecap="round" />
          ))}
        </g>
        <text x="18" y="23" textAnchor="middle" fontSize="13" fill="#a090e0" fontFamily="Gaegu, cursive">
          {children}
        </text>
      </svg>
    </div>
  );
}

function App() {
  const [practices, setPractices] = useState([]);
  const [currentNote, setCurrentNote] = useState(1);

  useEffect(() => {
    fetchPractices();
  }, [currentNote]);

  const fetchPractices = async () => {
    const data = await getAll();
    setPractices(data);
  };

  const currentRows = () => {
    const notePractices = practices
      .filter(p => p.noteNumber === currentNote)
      .sort((a, b) => a.id - b.id);
    const rows = [];
    for (let i = 0; i < ROWS_PER_NOTE; i++) {
      rows.push(notePractices[i] || null);
    }
    return rows;
  };

const handleBlur = async (row, field, value) => {
  if (!row) {
    if (!value) return;
    const newRow = {
      noteNumber: currentNote,
      practiceDate: field === 'practiceDate' ? value : null,
      songName: field === 'songName' ? value : null,
      count: 0
    };
    const saved = await create(newRow);
    setPractices(prev => [...prev, saved]);
    return;
  }

  if (value === String(row[field] || '')) return; // 변경 없으면 스킵

  // 빈값이면 null로 업데이트
  const finalValue = value || null;
  setPractices(prev => prev.map(p => p.id === row.id ? { ...p, [field]: finalValue } : p));
  update(row.id, { ...row, [field]: finalValue });
};

  const handleAppleClick = async (row, rowIndex, idx) => {
    const newCount = row ? (idx < row.count ? idx : idx + 1) : idx + 1;

    // 화면 즉시 업데이트
    if (row) {
      setPractices(prev => prev.map(p => p.id === row.id ? { ...p, count: newCount } : p));
      update(row.id, { ...row, count: newCount }); // 백그라운드 저장
    } else {
      const newRow = { noteNumber: currentNote, practiceDate: null, songName: null, count: newCount };
      const saved = await create(newRow);
      setPractices(prev => [...prev, saved]);
    }
  };

  const handleNextNote = () => {
    const notePractices = practices.filter(p => p.noteNumber === currentNote);
    if (notePractices.length < ROWS_PER_NOTE) {
      alert('현재 노트를 다 채워야 다음 노트로 넘어가요!');
      return;
    }
    setCurrentNote(prev => prev + 1);
    fetchPractices();
  };

  const rows = currentRows();

  return (
    <div className="notebook">
      <div className="notebook-title">🎸 연습 기록장</div>

      <div className="note-nav">
        <CrayonButton onClick={() => { setCurrentNote(p => Math.max(1, p - 1)); fetchPractices(); }} disabled={currentNote === 1}>◀</CrayonButton>
        <span>{currentNote}페이지</span>
        <CrayonButton onClick={handleNextNote}>▶</CrayonButton>
      </div>

      <table className="practice-table" key={`table-${currentNote}`}>
        <thead>
          <tr>
            <th className="th-date" style={{ width: '100px' }}>날짜</th>
            <th className="th-song" style={{ width: '120px' }}>곡명</th>
            <th className="th-count">연습 횟수</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row ? row.id : `empty-${i}`}>
              <td>
                <input
                  key={row ? `date-${row.id}-${row.practiceDate}` : `empty-date-${i}`}
                  className="cell-input date"
                  defaultValue={row?.practiceDate || ''}
                  placeholder="날짜"
                  onBlur={e => handleBlur(row, 'practiceDate', e.target.value)}
                />
              </td>
              <td>
                <input
                  key={row ? `song-${row.id}-${row.songName}` : `empty-song-${i}`}
                  className="cell-input song"
                  defaultValue={row?.songName || ''}
                  placeholder="곡명"
                  onBlur={e => handleBlur(row, 'songName', e.target.value)}
                />
              </td>
              <td>
                <div className="apples">
                  {Array.from({ length: APPLE_MAX }).map((_, idx) => (
                    <Apple
                      key={idx}
                      filled={row ? idx < row.count : false}
                      onClick={() => handleAppleClick(row, i, idx)}
                      appleIndex={row ? row.id * 10 + idx : idx}
                    />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 모바일 리스트 */}
      <div className="mobile-list">
        {rows.map((row, i) => (
          <div key={row ? `${currentNote}-${row.id}` : `${currentNote}-empty-${i}`} className="mobile-row">
            <div className="mobile-row-top">
              <input
                key={row ? `m-date-${currentNote}-${row.id}-${row.practiceDate}` : `m-empty-date-${currentNote}-${i}`}
                className="date"
                defaultValue={row?.practiceDate || ''}
                placeholder="날짜"
                onBlur={e => handleBlur(row, 'practiceDate', e.target.value)}
              />
              <input
                key={row ? `m-song-${currentNote}-${row.id}-${row.songName}` : `m-empty-song-${currentNote}-${i}`}
                className="song"
                defaultValue={row?.songName || ''}
                placeholder="곡명"
                onBlur={e => handleBlur(row, 'songName', e.target.value)}
              />
            </div>
            <div className="mobile-apples">
              {Array.from({ length: APPLE_MAX }).map((_, idx) => (
                <Apple
                  key={`${currentNote}-${row ? row.id : i}-${idx}`}
                  filled={row ? idx < row.count : false}
                  onClick={() => handleAppleClick(row, i, idx)}
                  appleIndex={row ? (row.id * 10 + idx) + 10000 : idx + 10000}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
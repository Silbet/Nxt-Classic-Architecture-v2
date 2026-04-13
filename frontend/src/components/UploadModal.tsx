import { useState, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { uploadTrack } from '../lib/api';
import type { Member } from '../types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const PARTS = ['보컬', '기타', '건반', '베이스', '드럼'] as const;

const currentYear = new Date().getFullYear();
const YEARS  = Array.from({ length: 10 }, (_, i) => currentYear - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function UploadModal({ onClose, onSuccess }: Props) {
  const [title, setTitle]   = useState('');
  const [artist, setArtist] = useState('');

  const [year,  setYear]  = useState<string>(String(currentYear));
  const [month, setMonth] = useState<string>('1');
  const [day,   setDay]   = useState<string>('1');

  const daysInMonth = getDaysInMonth(Number(year), Number(month));

  const handleYearChange = (v: string) => {
    setYear(v);
    const max = getDaysInMonth(Number(v), Number(month));
    if (Number(day) > max) setDay(String(max));
  };

  const handleMonthChange = (v: string) => {
    setMonth(v);
    const max = getDaysInMonth(Number(year), Number(v));
    if (Number(day) > max) setDay(String(max));
  };

  const [members, setMembers] = useState<Member[]>([{ name: '', part: PARTS[0] }]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLInputElement>(null);

  const addMember    = () => setMembers((prev) => [...prev, { name: '', part: PARTS[0] }]);
  const removeMember = (i: number) => setMembers((prev) => prev.filter((_, idx) => idx !== i));
  const updateMember = (i: number, field: keyof Member, value: string) =>
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) { setError('mp3 파일을 첨부해주세요.'); return; }

    setIsSubmitting(true);
    setError(null);

    try {
      const recordedAt = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const fd = new FormData();
      fd.append('title', title);
      fd.append('artist', artist);
      fd.append('recordedAt', recordedAt);
      fd.append('members', JSON.stringify(members.filter((m) => m.name.trim())));
      fd.append('audio', audioFile);

      await uploadTrack(fd);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass =
    'bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-bg-secondary w-full max-w-lg rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 id="upload-modal-title" className="text-base font-semibold text-text-primary">
            곡 추가
          </h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-text-secondary mb-1" htmlFor="upload-title">
              제목 <span className="text-red-400">*</span>
            </label>
            <input
              id="upload-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full ${selectClass}`}
            />
          </div>

          {/* Artist */}
          <div>
            <label className="block text-xs text-text-secondary mb-1" htmlFor="upload-artist">
              아티스트 <span className="text-red-400">*</span>
            </label>
            <input
              id="upload-artist"
              type="text"
              required
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className={`w-full ${selectClass}`}
            />
          </div>

          {/* Recorded At */}
          <div>
            <span className="block text-xs text-text-secondary mb-1">
              녹음일 <span className="text-red-400">*</span>
            </span>
            <div className="flex gap-2">
              <select
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                className={`flex-1 ${selectClass}`}
                aria-label="년도"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <select
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                className={`w-24 ${selectClass}`}
                aria-label="월"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className={`w-24 ${selectClass}`}
                aria-label="일"
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-secondary">멤버</span>
              <button
                type="button"
                onClick={addMember}
                className="flex items-center gap-1 text-xs text-accent hover:opacity-80 transition-opacity"
              >
                <Plus size={12} /> 추가
              </button>
            </div>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="이름"
                    value={m.name}
                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                    className={`flex-1 ${selectClass}`}
                    aria-label={`멤버 ${i + 1} 이름`}
                  />
                  <select
                    value={m.part}
                    onChange={(e) => updateMember(i, 'part', e.target.value)}
                    className={`w-28 ${selectClass}`}
                    aria-label={`멤버 ${i + 1} 파트`}
                  >
                    {PARTS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      className="text-text-muted hover:text-red-400 transition-colors"
                      aria-label={`멤버 ${i + 1} 삭제`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Audio File */}
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              오디오 파일 (.mp3) <span className="text-red-400">*</span>
            </label>
            <input
              ref={audioRef}
              type="file"
              accept=".mp3,audio/mpeg"
              className="hidden"
              onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              aria-label="mp3 파일 선택"
            />
            <button
              type="button"
              onClick={() => audioRef.current?.click()}
              className="w-full border border-dashed border-border rounded-lg px-3 py-2 text-sm text-text-muted hover:border-accent hover:text-text-primary transition-colors text-left"
            >
              {audioFile ? audioFile.name : 'mp3 파일 선택...'}
            </button>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? '업로드 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

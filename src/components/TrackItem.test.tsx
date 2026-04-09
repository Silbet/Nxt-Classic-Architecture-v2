import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TrackItem from './TrackItem';
import type { Track } from '../types';

const mockTrack: Track = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  duration: 185,
  recordedAt: '2024-01-15',
  uploadedAt: '2024-01-15T10:00:00Z',
  audioUrl: 'https://example.com/audio.mp3',
  coverUrl: 'https://example.com/cover.jpg',
  members: [
    { name: '홍길동', part: '기타' },
    { name: '김철수', part: '드럼' },
  ],
  playCount: 0,
};

const defaultProps = {
  track: mockTrack,
  index: 0,
  isActive: false as const,
  expanded: false,
  onSelect: vi.fn(),
  onToggleExpand: vi.fn(),
};

describe('TrackItem', () => {
  it('renders title, artist, album', () => {
    render(<TrackItem {...defaultProps} />);
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist · Test Album')).toBeInTheDocument();
  });

  it('renders cover image', () => {
    render(<TrackItem {...defaultProps} />);
    const img = screen.getByAltText('Test Album 커버');
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('does not show members by default (expanded=false)', () => {
    render(<TrackItem {...defaultProps} />);
    expect(screen.queryByText(/홍길동/)).not.toBeInTheDocument();
  });

  it('shows members when expanded=true', () => {
    render(<TrackItem {...defaultProps} expanded={true} />);
    expect(screen.getByText(/홍길동/)).toBeInTheDocument();
  });

  it('calls onToggleExpand when triangle button is clicked', () => {
    const onToggleExpand = vi.fn();
    render(<TrackItem {...defaultProps} onToggleExpand={onToggleExpand} />);
    const expandBtn = screen.getByRole('button', { name: /상세정보 펼치기/ });
    fireEvent.click(expandBtn);
    expect(onToggleExpand).toHaveBeenCalledOnce();
  });

  it('calls onSelect when play button is clicked', () => {
    const onSelect = vi.fn();
    render(<TrackItem {...defaultProps} onSelect={onSelect} />);
    const playBtn = screen.getByRole('button', { name: /재생/ });
    fireEvent.click(playBtn);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('does not call onSelect when expand button is clicked', () => {
    const onSelect = vi.fn();
    render(<TrackItem {...defaultProps} onSelect={onSelect} />);
    const expandBtn = screen.getByRole('button', { name: /상세정보/ });
    fireEvent.click(expandBtn);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('applies highlight styling when isActive is true', () => {
    const { container } = render(<TrackItem {...defaultProps} isActive={true} />);
    const li = container.querySelector('li');
    expect(li?.className).toContain('bg-bg-tertiary');
  });
});

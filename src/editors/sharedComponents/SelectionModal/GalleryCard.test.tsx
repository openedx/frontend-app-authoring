import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '../../../testUtils';
import GalleryCard from './GalleryCard';

jest.mock('../../utils', () => ({
  formatDuration: (duration) => `Duration: ${duration}`,
}));

jest.mock(
  '../../containers/VideoEditor/components/VideoSettingsModal/components/VideoPreviewWidget/LanguageNamesWidget',
  () => function mockLanguageNamesWidget({ transcripts }) {
    return <div>Languages: {transcripts && transcripts.join(', ')}</div>;
  },
);

const baseAsset = {
  contentType: 'video/mp4',
  displayName: 'Test Video',
  externalUrl: 'http://example.com/video.mp4',
  id: 'asset-1',
  dateAdded: new Date('2023-01-01T12:00:00Z'),
  locked: false,
  portableUrl: 'http://example.com/portable.mp4',
  thumbnail: 'http://example.com/thumb.jpg',
  url: 'http://example.com/video.mp4',
  duration: 120,
  status: 'ready',
  statusMessage: { id: 'status.ready', defaultMessage: 'Ready' },
  statusBadgeVariant: 'success',
  transcripts: ['en', 'es'],
};

describe('GalleryCard', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders component on screen', () => {
    render(<GalleryCard asset={baseAsset} />);
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  it('renders image with correct src', () => {
    render(<GalleryCard asset={baseAsset} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', baseAsset.externalUrl);
  });

  it('renders status badge when statusMessage and statusBadgeVariant are present', () => {
    render(<GalleryCard asset={baseAsset} />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('renders duration badge when duration is >= 0', () => {
    render(<GalleryCard asset={baseAsset} />);
    expect(screen.getByText('Duration: 120')).toBeInTheDocument();
  });

  it('renders LanguageNamesWidget when transcripts are present', () => {
    render(<GalleryCard asset={baseAsset} />);
    expect(screen.getByText('Languages: en, es')).toBeInTheDocument();
  });

  it('renders added date and time when dateAdded is present', () => {
    render(<GalleryCard asset={baseAsset} />);
    const dateAdded = screen.getByText(/Added/);
    expect(dateAdded).toBeInTheDocument();
    expect(dateAdded.innerHTML).toContain('1/1/2023');
    expect(dateAdded.innerHTML).toContain('12:00 PM');
  });

  it('renders thumbnailFallback when image fails to load', () => {
    const assetWithError = { ...baseAsset, externalUrl: 'error' };
    const fallback = <div>Fallback Image</div>;
    render(<GalleryCard asset={assetWithError} thumbnailFallback={fallback} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('Fallback Image')).toBeInTheDocument();
  });

  it('does not render status badge if statusMessage or statusBadgeVariant is missing', () => {
    const asset = { ...baseAsset, statusMessage: null };
    render(<GalleryCard asset={asset} />);
    expect(screen.queryByText('Ready')).not.toBeInTheDocument();
  });

  it('does not render duration badge if duration is undefined', () => {
    const asset = { ...baseAsset, duration: undefined };
    render(<GalleryCard asset={asset} />);
    expect(screen.queryByText(/Duration:/)).not.toBeInTheDocument();
  });

  it('does not render LanguageNamesWidget if transcripts is missing', () => {
    const asset = { ...baseAsset, transcripts: undefined };
    render(<GalleryCard asset={asset} />);
    expect(screen.queryByText(/Languages:/)).not.toBeInTheDocument();
  });

  it('does not render added date if dateAdded is missing', () => {
    const asset = { ...baseAsset, dateAdded: undefined };
    render(<GalleryCard asset={asset} />);
    expect(screen.queryByText(/Added/)).not.toBeInTheDocument();
  });
});

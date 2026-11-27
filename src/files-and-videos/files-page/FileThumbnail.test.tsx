import { getConfig } from '@edx/frontend-platform';
import { initializeMocks, render, screen } from '@src/testUtils';
import FileThumbnail from './FileThumbnail';

const imageSize = { width: '120px', height: '67.5px' };
const thumbnail = '/asset-v1:Org+Course+Run+type@thumbnail+block@photo-png.jpg';
const externalUrl = 'https://studio.example.com/asset-v1:Org+Course+Run+type@asset+block@photo.png';

describe('<FileThumbnail />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('shows the generated thumbnail for an image that has one', () => {
    render(
      <FileThumbnail
        thumbnail={thumbnail}
        wrapperType="image"
        externalUrl={externalUrl}
        displayName="photo.png"
        imageSize={imageSize}
      />,
    );
    expect(screen.getByRole('img', { name: 'photo.png file preview' })).toHaveAttribute(
      'src',
      `${getConfig().STUDIO_BASE_URL}${thumbnail}`,
    );
  });

  it('shows the full-size image for an image without a thumbnail', () => {
    render(
      <FileThumbnail
        thumbnail={null}
        wrapperType="image"
        externalUrl={externalUrl}
        displayName="photo.png"
        imageSize={imageSize}
      />,
    );
    expect(screen.getByRole('img', { name: 'photo.png file preview' })).toHaveAttribute('src', externalUrl);
  });

  it('shows an icon, not an image, for a non-image file', () => {
    render(
      <FileThumbnail
        thumbnail={null}
        wrapperType="document"
        externalUrl="https://studio.example.com/doc.pdf"
        displayName="doc.pdf"
        imageSize={imageSize}
      />,
    );
    expect(screen.queryByRole('img', { name: 'doc.pdf file preview' })).not.toBeInTheDocument();
  });
});

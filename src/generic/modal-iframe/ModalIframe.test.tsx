import { render } from '@testing-library/react';

import { IFRAME_FEATURE_POLICY } from '../../constants';
import ModalIframe, { SANDBOX_OPTIONS } from '.';

describe('ModalIframe Component', () => {
  const title = 'Legacy Edit Modal';
  const src = 'edit/xblock';

  it('renders without crashing', async () => {
    const { getByRole } = render(<ModalIframe title={title} src={src} />);

    expect(getByRole('dialog')).toBeInTheDocument();
  });

  it('renders iframe with correct src', () => {
    const { getByTitle } = render(<ModalIframe title={title} src={src} />);

    const iframe = getByTitle(title);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', src);
    expect(iframe).toHaveAttribute('allow', IFRAME_FEATURE_POLICY);
    expect(iframe).toHaveAttribute('class', 'modal-iframe');
    expect(iframe).toHaveAttribute('referrerpolicy', 'origin');
    expect(iframe).toHaveAttribute('sandbox', SANDBOX_OPTIONS);
    expect(iframe).toHaveAttribute('scrolling', 'no');
  });

  it('does not render when showLegacyEditModal is false', () => {
    const { container } = render(<ModalIframe title={title} src={src} />);

    expect(container.firstChild).not.toBeNull();
  });
});

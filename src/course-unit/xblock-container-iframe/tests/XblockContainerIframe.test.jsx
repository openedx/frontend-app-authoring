import { render } from '@testing-library/react';
import { getConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import XBlockContainerIframe from '..';
import { useIFrameBehavior } from '../hooks';
import { IFRAME_FEATURE_POLICY } from '../../constants';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('../hooks', () => ({
  useIFrameBehavior: jest.fn(),
}));

describe('<XBlockContainerIframe />', () => {
  const blockId = 'test-block-id';
  const iframeUrl = `http://example.com/container_embed/${blockId}`;
  const iframeHeight = '500px';

  beforeEach(() => {
    getConfig.mockReturnValue({ STUDIO_BASE_URL: 'http://example.com' });
    useIFrameBehavior.mockReturnValue({ iframeHeight });
  });

  it('renders correctly with the given blockId', () => {
    const { getByTitle } = render(
      <IntlProvider locale="en">
        <XBlockContainerIframe blockId={blockId} />
      </IntlProvider>,
    );
    const iframe = getByTitle('Course unit iframe');

    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', iframeUrl);
    expect(iframe).toHaveAttribute('frameBorder', '0');
    expect(iframe).toHaveAttribute('allow', IFRAME_FEATURE_POLICY);
    expect(iframe).toHaveAttribute('allowFullScreen');
    expect(iframe).toHaveAttribute('loading', 'lazy');
    expect(iframe).toHaveAttribute('scrolling', 'no');
    expect(iframe).toHaveAttribute('referrerPolicy', 'origin');
  });
});

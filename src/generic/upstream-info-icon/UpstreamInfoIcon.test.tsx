import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import { UpstreamInfoIcon, UpstreamInfoIconProps } from '.';

type UpstreamInfo = UpstreamInfoIconProps['upstreamInfo'];

const renderComponent = (upstreamInfo?: UpstreamInfo) => (
  render(
    <IntlProvider locale="en">
      <UpstreamInfoIcon upstreamInfo={upstreamInfo} />
    </IntlProvider>,
  )
);

describe('<UpstreamInfoIcon>', () => {
  it('should render with link', () => {
    renderComponent({ upstreamRef: 'some-ref', errorMessage: null });
    expect(screen.getByTitle('This item is linked to a library item.')).toBeInTheDocument();
  });

  it('should render with broken link', () => {
    renderComponent({ upstreamRef: 'some-ref', errorMessage: 'upstream error' });
    expect(screen.getByTitle('The link to the library item is broken.')).toBeInTheDocument();
  });

  it('should render null without upstream', () => {
    const { container } = renderComponent(undefined);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render null without upstreamRf', () => {
    const { container } = renderComponent({ upstreamRef: null, errorMessage: null });
    expect(container).toBeEmptyDOMElement();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import ModalIframe from './ModalIframe';

import { IFRAME_FEATURE_POLICY, SANDBOX_OPTIONS } from '../../constants';

describe('ModalIframe', () => {
  it('renders correctly with required props', () => {
    render(<ModalIframe title="Test Modal" />);

    const iframe = screen.getByTitle('Test Modal') as HTMLIFrameElement;

    expect(iframe).toBeInTheDocument();
    expect(iframe.title).toBe('Test Modal');
    expect(iframe.className).toContain('modal-iframe');
    expect(iframe.getAttribute('allow')).toBe(IFRAME_FEATURE_POLICY);
    expect(iframe.getAttribute('referrerpolicy')).toBe('origin');
    expect(iframe.getAttribute('sandbox')).toBe(SANDBOX_OPTIONS);
    expect(iframe.getAttribute('frameborder')).toBe('0');
    expect(iframe.getAttribute('scrolling')).toBe('no');
  });

  it('applies custom className', () => {
    const { getByTitle } = render(
      <ModalIframe title="Test Modal" className="custom-class" />,
    );

    const iframe = getByTitle('Test Modal') as HTMLIFrameElement;

    expect(iframe.className).toContain('modal-iframe');
    expect(iframe.className).toContain('custom-class');
  });

  it('passes additional props to iframe', () => {
    const { getByTitle } = render(
      <ModalIframe title="Test Modal" src="https://example.com" />,
    );

    const iframe = getByTitle('Test Modal') as HTMLIFrameElement;

    expect(iframe.src).toBe('https://example.com/');
  });

  it('forwards ref to iframe element', () => {
    const ref = React.createRef<HTMLIFrameElement>();
    render(<ModalIframe title="Test Modal" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLIFrameElement);
  });
});

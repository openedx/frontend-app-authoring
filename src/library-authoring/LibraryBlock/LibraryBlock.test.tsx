import { initializeMocks, render, screen } from '../../testUtils';
import { IframeProvider } from '../../generic/hooks/context/iFrameContext';
import { LibraryBlock } from '.';

const usageKey = 'lb:Org:Lib:html:block-1';
const minHeight = '70vh';

const renderBlock = (props = {}) =>
  render(
    <IframeProvider>
      <LibraryBlock usageKey={usageKey} minHeight={minHeight} {...props} />
    </IframeProvider>,
  );

describe('LibraryBlock', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('gives the frame the requested minimum height and does not stretch it', async () => {
    renderBlock();

    const iframe = await screen.findByTestId('block-preview');
    expect(iframe.style.minHeight).toBe(minHeight);
    expect(iframe.style.flex).toBe('');
  });

  it('stretches the frame to its container when asked to', async () => {
    renderBlock({ fillContainer: true });

    const iframe = await screen.findByTestId('block-preview');
    expect(iframe.style.flex).toBe('1 1 auto');
    expect(iframe.style.height).toBe('auto');
    expect(iframe.style.minHeight).toBe('0');
  });
});

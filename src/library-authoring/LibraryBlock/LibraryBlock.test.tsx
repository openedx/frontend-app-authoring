import { initializeMocks, render, screen } from '../../testUtils';
import { ADVANCED_EDITOR_MIN_HEIGHT } from '../../constants';
import { IframeProvider } from '../../generic/hooks/context/iFrameContext';
import { LibraryBlock } from '.';

const usageKey = 'lb:Org:Lib:html:block-1';

const renderBlock = (props = {}) =>
  render(
    <IframeProvider>
      <LibraryBlock usageKey={usageKey} minHeight={ADVANCED_EDITOR_MIN_HEIGHT} {...props} />
    </IframeProvider>,
  );

describe('LibraryBlock', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('sizes the frame to the height the block reports', async () => {
    renderBlock();

    const iframe = await screen.findByTestId('block-preview');
    expect(iframe.style.minHeight).toBe(ADVANCED_EDITOR_MIN_HEIGHT);
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

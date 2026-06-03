import {
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';

import { ResizableBox } from './Resizable';

describe('<ResizableBox>', () => {
  beforeEach(() => {
    initializeMocks();
    window.localStorage.clear();
  });

  it('reads initial width from localStorage when storageKey is provided', () => {
    window.localStorage.setItem('test-sidebar-width', JSON.stringify(600));

    render(
      <ResizableBox
        data-testid="resizable-box"
        storageKey="test-sidebar-width"
        minWidth={400}
        initialWidth={530}
      >
        <div>content</div>
      </ResizableBox>,
    );

    const root = screen.getByTestId('resizable-box');
    expect(root.getAttribute('style')).toContain('600px');
  });

  it('falls back to initialWidth when no localStorage value exists', () => {
    render(
      <ResizableBox
        data-testid="resizable-box"
        storageKey="test-sidebar-width"
        minWidth={400}
        initialWidth={530}
      >
        <div>content</div>
      </ResizableBox>,
    );

    const root = screen.getByTestId('resizable-box');
    expect(root.getAttribute('style')).toContain('530px');
  });

  it('falls back to minWidth when neither storageKey value nor initialWidth is set', () => {
    render(
      <ResizableBox data-testid="resizable-box" minWidth={400}>
        <div>content</div>
      </ResizableBox>,
    );

    const root = screen.getByTestId('resizable-box');
    expect(root.getAttribute('style')).toContain('400px');
  });

  it('uses initialWidth when storageKey localStorage value is invalid', () => {
    window.localStorage.setItem('test-sidebar-width', '"not-a-number"');

    render(
      <ResizableBox
        data-testid="resizable-box"
        storageKey="test-sidebar-width"
        minWidth={400}
        initialWidth={530}
      >
        <div>content</div>
      </ResizableBox>,
    );

    const root = screen.getByTestId('resizable-box');
    expect(root.getAttribute('style')).toContain('530px');
  });

  it('merges className onto the root element', () => {
    render(
      <ResizableBox data-testid="resizable-box" className="my-class" minWidth={400}>
        <div>content</div>
      </ResizableBox>,
    );

    const root = screen.getByTestId('resizable-box');
    expect(root).toHaveClass('resizable');
    expect(root).toHaveClass('my-class');
  });
});

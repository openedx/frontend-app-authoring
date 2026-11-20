import type { ComponentProps } from 'react';
import { useWindowSize } from '@openedx/paragon';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import {
  fireEvent,
  initializeMocks,
  render,
  userEvent,
} from '@src/testUtils';
import { RESIZING_BODY_CLASS, ResizableBox } from './Resizable';

jest.mock('@openedx/paragon', () => ({
  ...jest.requireActual('@openedx/paragon'),
  useWindowSize: jest.fn(),
}));
const mockUseWindowSize = useWindowSize as jest.Mock;

// Arbitrary drag-start position - only the delta between this and each
// drag's end position matters to the component's own math.
const START_X = 500;

const renderBox = (props: Partial<ComponentProps<typeof ResizableBox>> = {}) => {
  const result = render(
    <ResizableBox minWidth={200} maxWidth={600} {...props}>
      <div>Content</div>
    </ResizableBox>,
  );
  const handle = result.container.querySelector('.resizable-handle') as HTMLElement;
  const box = result.container.querySelector('.resizable') as HTMLElement;
  return { handle, box, ...result };
};

// `onMouseMove`/`onMouseUp` are attached to `document` (not the handle itself)
// on `mousedown`, so dragging works even once the cursor leaves the handle -
// see `Resizable.tsx`. Simulates one full drag: press the handle at `startX`,
// move to `endX`, then release.
const drag = (handle: HTMLElement, startX: number, endX: number) => {
  fireEvent.mouseDown(handle, { clientX: startX });
  fireEvent.mouseMove(document, { clientX: endX });
  fireEvent.mouseUp(document);
};

describe('<ResizableBox />', () => {
  beforeEach(() => {
    initializeMocks();
    mockUseWindowSize.mockReturnValue({ width: undefined, height: undefined });
  });

  describe('handleSide="left" (the default)', () => {
    it('grows when dragging left and shrinks when dragging right', () => {
      const { handle, box } = renderBox();
      expect(box.style.width).toBe('200px'); // initial width = minWidth

      drag(handle, START_X, START_X - 100); // dragged left by 100px
      expect(box.style.width).toBe('300px');

      drag(handle, START_X, START_X + 50); // dragged right by 50px, from the new 300px width
      expect(box.style.width).toBe('250px');
    });

    it('clamps at minWidth when dragging past the minimum', () => {
      const { handle, box } = renderBox();

      drag(handle, START_X, START_X + 1000); // dragging right shrinks - far past minWidth
      expect(box.style.width).toBe('200px');
    });

    it('clamps at maxWidth when dragging past the maximum', () => {
      const { handle, box } = renderBox();

      drag(handle, START_X, START_X - 1000); // dragging left grows - far past maxWidth
      expect(box.style.width).toBe('600px');
    });
  });

  describe('fullWidth', () => {
    it('renders at 100% width with no drag handle when true', () => {
      const { handle, box } = renderBox({ fullWidth: true });
      expect(box.style.width).toBe('100%');
      expect(handle).toBeNull();
    });

    it('keeps the normal pixel-width, draggable behavior when false (the default)', () => {
      const { handle, box } = renderBox({ fullWidth: false });
      expect(box.style.width).toBe('200px'); // initial width = minWidth
      expect(handle).not.toBeNull();

      drag(handle, START_X, START_X - 100); // dragged left by 100px
      expect(box.style.width).toBe('300px');
    });
  });

  describe('stretchContent', () => {
    it('does not wrap children when false (the default)', () => {
      const { box } = renderBox();
      expect(box.querySelector('.w-100')).toBeNull();
    });

    it('wraps children in a width-100% div when true', () => {
      const { box } = renderBox({ stretchContent: true });
      const wrapper = box.querySelector('.w-100');
      expect(wrapper).not.toBeNull();
      expect(wrapper).toHaveTextContent('Content');
    });
  });

  describe('handleSide="right"', () => {
    it('grows when dragging right and shrinks when dragging left', () => {
      const { handle, box } = renderBox({ handleSide: 'right' });
      expect(box.style.width).toBe('200px'); // initial width = minWidth

      drag(handle, START_X, START_X + 100); // dragged right by 100px
      expect(box.style.width).toBe('300px');

      drag(handle, START_X, START_X - 50); // dragged left by 50px, from the new 300px width
      expect(box.style.width).toBe('250px');
    });

    it('clamps at minWidth when dragging past the minimum', () => {
      const { handle, box } = renderBox({ handleSide: 'right' });

      drag(handle, START_X, START_X - 1000); // dragging left shrinks - far past minWidth
      expect(box.style.width).toBe('200px');
    });

    it('clamps at maxWidth when dragging past the maximum', () => {
      const { handle, box } = renderBox({ handleSide: 'right' });

      drag(handle, START_X, START_X + 1000); // dragging right grows - far past maxWidth
      expect(box.style.width).toBe('600px');
    });
  });

  describe('without a maxWidth, clamped to 65% of the window', () => {
    const renderUnbounded = () => {
      const { container, rerender } = render(
        <ResizableBox minWidth={200}>
          <div>Content</div>
        </ResizableBox>,
      );
      const handle = container.querySelector('.resizable-handle') as HTMLElement;
      const box = container.querySelector('.resizable') as HTMLElement;
      const resizeWindow = (width: number) => {
        mockUseWindowSize.mockReturnValue({ width, height: 800 });
        rerender(
          <ResizableBox minWidth={200}>
            <div>Content</div>
          </ResizableBox>,
        );
      };
      return { handle, box, resizeWindow };
    };

    it('shrinks a dragged width when the window narrows and restores it when it widens', () => {
      const { handle, box, resizeWindow } = renderUnbounded();
      resizeWindow(1000); // max 650px
      drag(handle, START_X, START_X - 400); // 200 + 400 = 600px
      expect(box.style.width).toBe('600px');

      resizeWindow(800); // max 520px
      expect(box.style.width).toBe('520px');

      resizeWindow(1000);
      expect(box.style.width).toBe('600px');
    });

    it('never clamps below minWidth on a very narrow window', () => {
      const { box, resizeWindow } = renderUnbounded();
      resizeWindow(200); // 65% = 130px, below minWidth
      expect(box.style.width).toBe('200px');
    });

    it('starts a new drag from the clamped width that is displayed', () => {
      const { handle, box, resizeWindow } = renderUnbounded();
      resizeWindow(1000);
      drag(handle, START_X, START_X - 400); // 600px
      resizeWindow(800); // displayed at 520px, 600px still stored

      drag(handle, START_X, START_X + 20); // dragged right by 20px shrinks from 520px
      expect(box.style.width).toBe('500px');
    });
  });

  it('never drags below minWidth when maxWidth is smaller than it', () => {
    const { handle, box } = renderBox({ maxWidth: 100 }); // e.g. a caller's limit on a tiny window

    drag(handle, START_X, START_X - 300); // dragging left grows, but maxWidth is below minWidth
    expect(box.style.width).toBe('200px');
  });
});

describe('<ResizableBox /> keyboard and accessibility', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('exposes the handle as a labelled window splitter', () => {
    const { handle } = renderBox({ initialWidth: 300 });
    expect(handle).toHaveAttribute('role', 'separator');
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    expect(handle).toHaveAccessibleName('Resize panel');
    expect(handle).toHaveAttribute('aria-valuemin', '200');
    expect(handle).toHaveAttribute('aria-valuemax', '600');
    expect(handle).toHaveAttribute('aria-valuenow', '300');
    expect(handle).toHaveAttribute('aria-valuetext', '300 pixels wide');
    expect(handle).toHaveAttribute('tabindex', '0');
  });

  it('uses the handle label given by the caller', () => {
    const { handle } = renderBox({ handleLabel: 'Resize sidebar' });
    expect(handle).toHaveAccessibleName('Resize sidebar');
  });

  it('starts at initialWidth, clamped to the allowed range', () => {
    expect(renderBox({ initialWidth: 350 }).box.style.width).toBe('350px');
    expect(renderBox({ initialWidth: 50 }).box.style.width).toBe('200px');
    expect(renderBox({ initialWidth: 5000 }).box.style.width).toBe('600px');
  });

  it('resizes with the arrow keys, Shift for bigger steps, Home and End for the limits', async () => {
    const user = userEvent.setup();
    const onResizeEnd = jest.fn();
    const { handle, box } = renderBox({ initialWidth: 300, onResizeEnd });

    await user.tab(); // the handle is the only focusable element
    expect(handle).toHaveFocus();
    await user.keyboard('{ArrowLeft}'); // left-hand handle: moving left grows
    expect(box.style.width).toBe('316px');
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(box.style.width).toBe('252px');
    await user.keyboard('{Home}');
    expect(box.style.width).toBe('200px');
    await user.keyboard('{End}');
    expect(box.style.width).toBe('600px');
    await user.keyboard('a'); // unrelated keys are left alone
    expect(box.style.width).toBe('600px');

    expect(handle).toHaveAttribute('aria-valuenow', '600');
    expect(onResizeEnd.mock.calls.map(([width]) => width)).toEqual([316, 252, 200, 600]);
  });

  it('swaps the arrow directions for a right-hand handle', async () => {
    const user = userEvent.setup();
    const { handle, box } = renderBox({ initialWidth: 300, handleSide: 'right' });
    handle.focus();
    await user.keyboard('{ArrowRight}');
    expect(box.style.width).toBe('316px');
    await user.keyboard('{ArrowLeft}');
    expect(box.style.width).toBe('300px');
  });
});

describe('<ResizableBox /> in a right-to-left locale', () => {
  beforeEach(() => {
    initializeMocks();
    mockUseWindowSize.mockReturnValue({ width: undefined, height: undefined });
  });

  // The RTL stylesheet mirrors the layout, so a left-hand handle sits on the box's right edge
  // and the drag and arrow-key directions have to be mirrored with it.
  const renderRtlBox = (props: Partial<ComponentProps<typeof ResizableBox>> = {}) => {
    const result = render(
      <IntlProvider locale="ar" messages={{}}>
        <ResizableBox minWidth={200} maxWidth={600} initialWidth={300} {...props}>
          <div>Content</div>
        </ResizableBox>
      </IntlProvider>,
    );
    const handle = result.container.querySelector('.resizable-handle') as HTMLElement;
    const box = result.container.querySelector('.resizable') as HTMLElement;
    return { handle, box };
  };

  it('grows a left-hand handle when dragging right', () => {
    const { handle, box } = renderRtlBox();
    drag(handle, START_X, START_X + 100);
    expect(box.style.width).toBe('400px');
    drag(handle, START_X, START_X - 50);
    expect(box.style.width).toBe('350px');
  });

  it('grows a right-hand handle when dragging left', () => {
    const { handle, box } = renderRtlBox({ handleSide: 'right' });
    drag(handle, START_X, START_X - 100);
    expect(box.style.width).toBe('400px');
  });

  it('mirrors the arrow keys', async () => {
    const user = userEvent.setup();
    const { handle, box } = renderRtlBox();
    handle.focus();
    await user.keyboard('{ArrowRight}');
    expect(box.style.width).toBe('316px');
    await user.keyboard('{ArrowLeft}');
    expect(box.style.width).toBe('300px');

    const rightHandle = renderRtlBox({ handleSide: 'right' });
    rightHandle.handle.focus();
    await user.keyboard('{ArrowLeft}');
    expect(rightHandle.box.style.width).toBe('316px');
  });
});

describe('<ResizableBox /> drag lifecycle', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('reports the final width once per drag, and not for a click without movement', () => {
    const onResizeEnd = jest.fn();
    const { handle } = renderBox({ onResizeEnd });

    drag(handle, START_X, START_X - 100);
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    expect(onResizeEnd).toHaveBeenCalledWith(300);

    drag(handle, START_X, START_X);
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
  });

  it('marks the page while dragging and ignores secondary mouse buttons', () => {
    const { handle } = renderBox();

    fireEvent.mouseDown(handle, { clientX: START_X, button: 2 });
    expect(document.body).not.toHaveClass(RESIZING_BODY_CLASS);

    // The class goes on <body>, not the box, so iframes outside the box are covered too.
    fireEvent.mouseDown(handle, { clientX: START_X });
    expect(document.body).toHaveClass(RESIZING_BODY_CLASS);
    fireEvent.mouseUp(document);
    expect(document.body).not.toHaveClass(RESIZING_BODY_CLASS);
  });

  it('removes its document listeners and the page marker if unmounted mid-drag', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    const { handle, unmount } = renderBox();
    fireEvent.mouseDown(handle, { clientX: START_X });
    expect(document.body).toHaveClass(RESIZING_BODY_CLASS);

    unmount();

    const removed = removeSpy.mock.calls.map(([type]) => type);
    expect(removed).toEqual(expect.arrayContaining(['mousemove', 'mouseup']));
    expect(document.body).not.toHaveClass(RESIZING_BODY_CLASS);
    removeSpy.mockRestore();
  });

  it('reports the clamped maximum to assistive technology when the window narrows', () => {
    // No maxWidth: the limit is 65% of the window width.
    mockUseWindowSize.mockReturnValue({ width: 1024, height: 800 });
    const { handle, box, rerender } = renderBox({ maxWidth: undefined });
    drag(handle, START_X, START_X - 300);
    expect(box.style.width).toBe('500px');

    mockUseWindowSize.mockReturnValue({ width: 600, height: 800 }); // 65% of 600 = 390
    rerender(
      <ResizableBox minWidth={200}>
        <div>Content</div>
      </ResizableBox>,
    );
    expect(box.style.width).toBe('390px');
    expect(handle).toHaveAttribute('aria-valuemax', '390');
    expect(handle).toHaveAttribute('aria-valuenow', '390');
  });
});

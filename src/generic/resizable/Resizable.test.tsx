import type { ComponentProps } from 'react';

import {
  fireEvent,
  initializeMocks,
  render,
} from '@src/testUtils';
import { ResizableBox } from './Resizable';

// Arbitrary drag-start position - only the delta between this and each
// drag's end position matters to the component's own math.
const START_X = 500;

const renderBox = (props: Partial<ComponentProps<typeof ResizableBox>> = {}) => {
  const { container } = render(
    <ResizableBox minWidth={200} maxWidth={600} {...props}>
      <div>Content</div>
    </ResizableBox>,
  );
  const handle = container.querySelector('.resizable-handle') as HTMLElement;
  const box = container.querySelector('.resizable') as HTMLElement;
  return { handle, box };
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
});

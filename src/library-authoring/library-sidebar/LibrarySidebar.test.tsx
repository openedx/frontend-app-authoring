import {
  initializeMocks,
  render as baseRender,
  screen,
  userEvent,
} from '@src/testUtils';

import { ComponentPickerProvider } from '../common/context/ComponentPickerContext';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarBodyItemId, SidebarProvider } from '../common/context/SidebarContext';
import { mockContentLibrary } from '../data/api.mocks';
import LibrarySidebar, {
  MAIN_CONTENT_MIN_WIDTH,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_WIDTH_STORAGE_KEY,
} from './LibrarySidebar';

// A desktop-sized window; jsdom defaults to 1024px, which leaves no room to grow past the default.
const WINDOW_WIDTH = 1440;

mockContentLibrary.applyMock();

const render = ({ inComponentPicker = false } = {}) =>
  baseRender(<LibrarySidebar />, {
    extraWrapper: ({ children }) => {
      const providers = (
        <LibraryProvider libraryId={mockContentLibrary.libraryId}>
          <SidebarProvider initialSidebarItemInfo={{ id: '', type: SidebarBodyItemId.Info }}>
            {children}
          </SidebarProvider>
        </LibraryProvider>
      );
      return inComponentPicker
        ? (
          <ComponentPickerProvider componentPickerMode="single" onComponentSelected={jest.fn()}>
            {providers}
          </ComponentPickerProvider>
        )
        : providers;
    },
  });

const sidebarWidth = () =>
  (screen.getByTestId('library-sidebar').querySelector('.resizable') as HTMLElement).style.width;

describe('<LibrarySidebar />', () => {
  beforeEach(() => {
    initializeMocks();
    localStorage.clear();
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: WINDOW_WIDTH });
  });

  it('renders at the default width with a labelled resize handle', async () => {
    render();
    expect(await screen.findByRole('button', { name: /close/i })).toBeInTheDocument();
    expect(sidebarWidth()).toBe(`${SIDEBAR_DEFAULT_WIDTH}px`);

    const handle = screen.getByRole('separator', { name: 'Resize sidebar' });
    expect(handle).toHaveAttribute('aria-valuenow', String(SIDEBAR_DEFAULT_WIDTH));
  });

  it('restores the width chosen earlier', async () => {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, '640');
    render();
    expect(await screen.findByTestId('library-sidebar')).toBeInTheDocument();
    expect(sidebarWidth()).toBe('640px');
  });

  it('remembers a keyboard resize', async () => {
    const user = userEvent.setup();
    render();
    const handle = await screen.findByRole('separator', { name: 'Resize sidebar' });
    handle.focus();
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');

    expect(sidebarWidth()).toBe(`${SIDEBAR_DEFAULT_WIDTH + 64}px`);
    expect(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)).toBe(String(SIDEBAR_DEFAULT_WIDTH + 64));
  });

  it('falls back to the default width when the stored value is not a number', async () => {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, '"wide"');
    render();
    expect(await screen.findByTestId('library-sidebar')).toBeInTheDocument();
    expect(sidebarWidth()).toBe(`${SIDEBAR_DEFAULT_WIDTH}px`);
  });

  it('cannot grow past the default width inside the component picker', async () => {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, '800');
    render({ inComponentPicker: true });
    const handle = await screen.findByRole('separator', { name: 'Resize sidebar' });

    expect(sidebarWidth()).toBe(`${SIDEBAR_DEFAULT_WIDTH}px`);
    expect(handle).toHaveAttribute('aria-valuemax', String(SIDEBAR_DEFAULT_WIDTH));
    // The preference itself is kept for the full-size library pages.
    expect(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)).toBe('800');
  });

  it('leaves room for the main column when the window is small for the stored width', async () => {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, '900');
    render();
    const handle = await screen.findByRole('separator', { name: 'Resize sidebar' });

    const expected = WINDOW_WIDTH - MAIN_CONTENT_MIN_WIDTH;
    expect(sidebarWidth()).toBe(`${expected}px`);
    expect(handle).toHaveAttribute('aria-valuemax', String(expected));
    // The preference is kept for a wider window.
    expect(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)).toBe('900');
  });
});

import {
  fireEvent,
  initializeMocks,
  render as baseRender,
  screen,
} from '../../testUtils';
import { LibraryProvider } from '../common/context';
import { mockContentLibrary, mockLibraryBlockMetadata } from '../data/api.mocks';
import ComponentPreview from './ComponentPreview';

mockLibraryBlockMetadata.applyMock();
mockContentLibrary.applyMock();

const {
  libraryId,
} = mockContentLibrary;

const usageKey = mockLibraryBlockMetadata.usageKeyPublished;

const render = () => baseRender(<ComponentPreview />, {
  extraWrapper: ({ children }) => (
    <LibraryProvider
      libraryId={libraryId}
      sidebarComponentUsageKey={usageKey}
    >
      { children }
    </LibraryProvider>
  ),
});

describe('<ComponentPreview />', () => {
  it('renders a preview of the component', async () => {
    initializeMocks();
    render();
    const iframe = (await screen.findByTitle('Preview')) as HTMLIFrameElement;
    expect(iframe.src).toEqual(`http://localhost:18000/xblocks/v2/${usageKey}/embed/student_view/`);
  });

  it('shows an expanded preview of the component', async () => {
    initializeMocks();
    render();
    await screen.findByTitle('Preview'); // Wait for the preview to appear
    const expandButton = screen.getByRole('button', { name: /Expand/ });
    fireEvent.click(expandButton);

    const dialog = await screen.findByRole('dialog', { name: /component preview/i });
    const dialogIframe = dialog.querySelector('iframe')!;
    expect(dialogIframe).not.toBeNull();
    expect(dialogIframe).toHaveAttribute('title', 'Preview');
    expect(dialogIframe.src).toEqual(`http://localhost:18000/xblocks/v2/${usageKey}/embed/student_view/`);
  });
});

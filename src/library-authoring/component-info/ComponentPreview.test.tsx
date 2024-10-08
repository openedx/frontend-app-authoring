import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '../../testUtils';
import { mockLibraryBlockMetadata } from '../data/api.mocks';
import ComponentPreview from './ComponentPreview';

mockLibraryBlockMetadata.applyMock();

describe('<ComponentPreview />', () => {
  it('renders a preview of the component', async () => {
    initializeMocks();
    const usageKey = mockLibraryBlockMetadata.usageKeyPublished;
    render(<ComponentPreview usageKey={usageKey} />);
    const iframe = (await screen.findByTitle('Preview')) as HTMLIFrameElement;
    expect(iframe.src).toEqual(`http://localhost:18000/xblocks/v2/${usageKey}/embed/student_view/`);
  });

  it('shows an expanded preview of the component', async () => {
    initializeMocks();
    const usageKey = mockLibraryBlockMetadata.usageKeyPublished;
    render(<ComponentPreview usageKey={usageKey} />);
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

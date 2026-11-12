import { mockContentLibrary, mockLibraryBlockMetadata } from '../data/api.mocks';
import {
  fireEvent,
  render,
  screen,
  initializeMocks,
  within,
} from '../../testUtils';

import PreviewChangesEmbed from './PreviewChangesEmbed';

mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
const usageKey = mockLibraryBlockMetadata.usageKeyWithCollections;

describe('<CompareChangesWidget />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('can compare published (old) and draft (new) versions by default', async () => {
    render(<PreviewChangesEmbed />, {
      path: '/legacy/preview-changes/:usageKey',
      routerProps: { initialEntries: [`/legacy/preview-changes/${usageKey}/?old=13`] },
    });

    // By default we see the new version (the published version):
    const newTab = screen.getByRole('tab', { name: 'New version' });
    expect(newTab).toBeInTheDocument();
    expect(newTab).toHaveClass('active');

    const newTabPanel = screen.getByRole('tabpanel', { name: 'New version' });
    const newIframe = within(newTabPanel).getByTitle('Preview');
    expect(newIframe).toBeVisible();
    expect(newIframe).toHaveAttribute(
      'src',
      `http://localhost:18010/xblocks/v2/${usageKey}/embed/student_view/?version=published`,
    );

    // Now switch to the "old version" tab:
    const oldTab = screen.getByRole('tab', { name: 'Old version' });
    fireEvent.click(oldTab);

    const oldTabPanel = screen.getByRole('tabpanel', { name: 'Old version' });
    expect(oldTabPanel).toBeVisible();
    const oldIframe = within(oldTabPanel).getByTitle('Preview');
    expect(oldIframe).toBeVisible();
    expect(oldIframe).toHaveAttribute(
      'src',
      `http://localhost:18010/xblocks/v2/${usageKey}/embed/student_view/?version=13`,
    );
  });

  it('forwards downstream_block_id from the query string to both version iframes', async () => {
    render(<PreviewChangesEmbed />, {
      path: '/legacy/preview-changes/:usageKey',
      routerProps: {
        initialEntries: [
          `/legacy/preview-changes/${usageKey}/?old=13&downstream_block_id=block-v1:org+course+run+type@vertical+block@unit`,
        ],
      },
    });

    const newTabPanel = screen.getByRole('tabpanel', { name: 'New version' });
    const newIframe = within(newTabPanel).getByTitle('Preview');
    expect(newIframe.getAttribute('src')).toContain(
      'downstream_block_id=block-v1%3Aorg+course+run+type%40vertical+block%40unit',
    );

    const oldTab = screen.getByRole('tab', { name: 'Old version' });
    fireEvent.click(oldTab);

    const oldTabPanel = screen.getByRole('tabpanel', { name: 'Old version' });
    const oldIframe = within(oldTabPanel).getByTitle('Preview');
    expect(oldIframe.getAttribute('src')).toContain(
      'downstream_block_id=block-v1%3Aorg+course+run+type%40vertical+block%40unit',
    );
  });
});

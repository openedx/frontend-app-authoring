import {
  fireEvent,
  render as baseRender,
  screen,
  waitFor,
  initializeMocks,
} from '../../testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { getClipboardUrl } from '../../generic/data/api';
import { ContentHit } from '../../search-manager';
import ComponentCard from './ComponentCard';
import { PublishStatus } from '../../search-manager/data/api';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useNavigate: () => mockNavigate,
}));

const contentHit: ContentHit = {
  id: '1',
  usageKey: 'lb:org1:demolib:html:a1fa8bdd-dc67-4976-9bf5-0ea75a9bca3d',
  type: 'library_block',
  blockId: 'a1fa8bdd-dc67-4976-9bf5-0ea75a9bca3d',
  contextKey: 'lib:org1:Demo_Course',
  org: 'org1',
  breadcrumbs: [{ displayName: 'Demo Lib' }],
  displayName: 'Text Display Name',
  description: 'This is a text: ID=1',
  formatted: {
    displayName: 'Text Display Formated Name',
    content: {
      htmlContent: 'This is a text: ID=1',
    },
    description: 'This is a text: ID=1',
  },
  tags: {
    level0: ['1', '2', '3'],
  },
  blockType: 'html',
  created: 1722434322294,
  modified: 1722434322294,
  lastPublished: null,
  collections: {},
  publishStatus: PublishStatus.Published,
};

const libraryId = 'lib:org1:Demo_Course';
const render = () => baseRender(<ComponentCard hit={contentHit} />, {
  path: '/library/:libraryId',
  params: { libraryId },
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId}>
      { children }
    </LibraryProvider>
  ),
});

describe('<ComponentCard />', () => {
  it('should render the card with title and description', () => {
    initializeMocks();
    render();

    expect(screen.getByText('Text Display Formated Name')).toBeInTheDocument();
    expect(screen.getByText('This is a text: ID=1')).toBeInTheDocument();
  });

  it('should call the updateClipboard function when the copy button is clicked', async () => {
    const { axiosMock, mockShowToast } = initializeMocks();
    axiosMock.onPost(getClipboardUrl()).reply(200, {});
    render();

    // Open menu
    expect(screen.getByTestId('component-card-menu-toggle')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('component-card-menu-toggle'));

    // Click copy to clipboard
    expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(
      JSON.stringify({ usage_key: contentHit.usageKey }),
    );

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Copying');
      expect(mockShowToast).toHaveBeenCalledWith('Copied to clipboard');
    });
  });

  it('should show error message if the api call fails', async () => {
    const { axiosMock, mockShowToast } = initializeMocks();
    axiosMock.onPost(getClipboardUrl()).reply(400);
    render();

    // Open menu
    expect(screen.getByTestId('component-card-menu-toggle')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('component-card-menu-toggle'));

    // Click copy to clipboard
    expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(
      JSON.stringify({ usage_key: contentHit.usageKey }),
    );

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Copying');
      expect(mockShowToast).toHaveBeenCalledWith('Error copying to clipboard');
    });
  });

  it('should select component on clicking edit menu option', async () => {
    initializeMocks();
    render();

    // Open menu
    const menu = await screen.findByTestId('component-card-menu-toggle');
    expect(menu).toBeInTheDocument();
    fireEvent.click(menu);

    // Click copy to clipboard
    const editOption = await screen.findByRole('button', { name: 'Edit' });
    expect(editOption).toBeInTheDocument();
    fireEvent.click(editOption);
    // Verify that the url is updated to component url i.e. component is selected
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: `/library/${libraryId}/component/${contentHit.usageKey}`,
      search: '',
    });
  });
});

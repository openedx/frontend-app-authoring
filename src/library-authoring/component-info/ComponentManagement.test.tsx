import {
  initializeMocks,
  render,
  screen,
} from '../../testUtils';
import { mockLibraryBlockMetadata } from '../data/api.mocks';
import ComponentManagement from './ComponentManagement';

describe('<ComponentManagement />', () => {
  it('should render draft status', async () => {
    initializeMocks();
    mockLibraryBlockMetadata.applyMock();
    render(<ComponentManagement usageKey={mockLibraryBlockMetadata.usageKeyNeverPublished} />);
    expect(await screen.findByText('Draft')).toBeInTheDocument();
    expect(screen.queryByText('Draft(Never Published)')).not.toBeInTheDocument();
    expect(screen.queryByText('Draft saved on June 20, 2024 at 13:54 UTC.)')).not.toBeInTheDocument();
  });
});

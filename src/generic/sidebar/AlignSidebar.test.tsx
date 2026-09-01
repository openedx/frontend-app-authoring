import { initializeMocks, render, screen, userEvent } from '@src/testUtils';
import { AlignSidebar } from './AlignSidebar';

jest.mock('@src/content-tags-drawer', () => ({
  ContentTagsDrawer: jest.fn(({ id, variant, readOnly }) => (
    <div>
      drawer-mock-{id}-{variant}-{String(readOnly)}
    </div>
  )),
}));

describe('<AlignSidebar />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the title and an editable tags drawer by default', () => {
    render(<AlignSidebar contentId="block-1" title="Unit 1" />);

    expect(screen.getByRole('heading', { name: 'Unit 1' })).toBeInTheDocument();
    expect(screen.getByText('drawer-mock-block-1-component-false')).toBeInTheDocument();
  });

  it('renders a read-only tags drawer when readOnly is set', () => {
    render(<AlignSidebar contentId="block-1" title="Unit 1" readOnly />);

    expect(screen.getByText('drawer-mock-block-1-component-true')).toBeInTheDocument();
  });

  it('shows a back button only when onBackBtnClick is provided', async () => {
    const user = userEvent.setup();
    const onBackBtnClick = jest.fn();
    const { rerender } = render(<AlignSidebar contentId="block-1" title="Unit 1" />);

    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();

    rerender(<AlignSidebar contentId="block-1" title="Unit 1" onBackBtnClick={onBackBtnClick} />);
    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(onBackBtnClick).toHaveBeenCalled();
  });
});

import {
  fireEvent,
  render,
  screen,
  initializeMocks,
  within,
} from '../../testUtils';

import CompareChangesWidget from './CompareChangesWidget';

const usageKey = 'lb:org:lib:type:id';

describe('<CompareChangesWidget />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('can compare published (old) and draft (new) versions by default', async () => {
    render(<CompareChangesWidget usageKey={usageKey} />);

    // By default we see the new version:
    const newTab = screen.getByRole('tab', { name: 'New version' });
    expect(newTab).toBeInTheDocument();
    expect(newTab).toHaveClass('active');

    const newTabPanel = screen.getByRole('tabpanel', { name: 'New version' });
    const newIframe = within(newTabPanel).getByTitle('Preview');
    expect(newIframe).toBeVisible();
    expect(newIframe).toHaveAttribute(
      'src',
      `http://localhost:18010/xblocks/v2/${usageKey}/embed/student_view/?version=draft`,
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
      `http://localhost:18010/xblocks/v2/${usageKey}/embed/student_view/?version=published`,
    );
  });

  it('can compare a specific old and published (new) version', async () => {
    render(<CompareChangesWidget usageKey={usageKey} oldVersion={7} newVersion="published" />);

    // By default we see the new version:
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
      `http://localhost:18010/xblocks/v2/${usageKey}/embed/student_view/?version=7`,
    );
  });
});

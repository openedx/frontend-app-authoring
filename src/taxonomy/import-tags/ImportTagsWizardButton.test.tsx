import {
  act,
  initializeMocks,
  render,
  screen,
  userEvent,
} from '@src/testUtils';
import { TaxonomyType } from '@src/taxonomy/data/constants';
import { ImportTagsWizard } from './ImportTagsWizard';
import { ImportTagsWizardButton } from './ImportTagsWizardButton';

jest.mock('./ImportTagsWizard', () => ({
  ImportTagsWizard: jest.fn(() => <div data-testid="import-tags-wizard" />),
}));

const mockWizard = ImportTagsWizard as jest.MockedFunction<typeof ImportTagsWizard>;

/** The props the button passed to the wizard on its most recent render. */
const lastWizardProps = () => mockWizard.mock.calls[mockWizard.mock.calls.length - 1][0];

describe('<ImportTagsWizardButton />', () => {
  beforeEach(() => {
    initializeMocks();
    mockWizard.mockClear();
  });

  it('renders the button with the caller\'s props, and no wizard', () => {
    render(
      <ImportTagsWizardButton data-testid="import-button" disabled>
        Import
      </ImportTagsWizardButton>,
    );

    expect(screen.getByTestId('import-button')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
    expect(screen.queryByTestId('import-tags-wizard')).not.toBeInTheDocument();
    expect(mockWizard).not.toHaveBeenCalled();
  });

  it('opens the wizard when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<ImportTagsWizardButton>Import</ImportTagsWizardButton>);

    await user.click(screen.getByRole('button', { name: 'Import' }));

    expect(await screen.findByTestId('import-tags-wizard')).toBeInTheDocument();
    expect(lastWizardProps().isOpen).toBe(true);
  });

  it('closes the wizard when the wizard calls onClose', async () => {
    const user = userEvent.setup();
    render(<ImportTagsWizardButton>Import</ImportTagsWizardButton>);
    await user.click(screen.getByRole('button', { name: 'Import' }));
    expect(await screen.findByTestId('import-tags-wizard')).toBeInTheDocument();

    await act(async () => {
      lastWizardProps().onClose();
    });

    expect(screen.queryByTestId('import-tags-wizard')).not.toBeInTheDocument();
  });

  it('passes defaultTaxonomyType and onImportSuccess through to the wizard', async () => {
    const user = userEvent.setup();
    const onImportSuccess = jest.fn();
    render(
      <ImportTagsWizardButton
        defaultTaxonomyType={TaxonomyType.Competency}
        onImportSuccess={onImportSuccess}
      >
        Import
      </ImportTagsWizardButton>,
    );

    await user.click(screen.getByRole('button', { name: 'Import' }));
    expect(await screen.findByTestId('import-tags-wizard')).toBeInTheDocument();

    expect(lastWizardProps()).toMatchObject({
      defaultTaxonomyType: TaxonomyType.Competency,
      onImportSuccess,
    });
  });

  it('leaves defaultTaxonomyType unset when the caller omits it, so the wizard picks its own default', async () => {
    const user = userEvent.setup();
    render(<ImportTagsWizardButton>Import</ImportTagsWizardButton>);

    await user.click(screen.getByRole('button', { name: 'Import' }));
    expect(await screen.findByTestId('import-tags-wizard')).toBeInTheDocument();

    expect(lastWizardProps().defaultTaxonomyType).toBeUndefined();
  });
});

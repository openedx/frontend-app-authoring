import { initializeMocks, render, screen, within, userEvent } from '@src/testUtils';

import { signatoriesMock } from '../__mocks__';
import commonMessages from '../messages';
import messages from './messages';
import useEditSignatory from './hooks/useEditSignatory';
import useCreateSignatory from './hooks/useCreateSignatory';

const mockUseEditSignatory = jest.mocked(useEditSignatory);
const mockUseCreateSignatory = jest.mocked(useCreateSignatory);
import CertificateSignatories from './CertificateSignatories';

jest.mock('./hooks/useEditSignatory');
jest.mock('./hooks/useCreateSignatory');

const mockArrayHelpers = {
  push: jest.fn(),
  remove: jest.fn(),
};

const renderComponent = (props) =>
  render(
    <CertificateSignatories {...props} />,
  );

const defaultProps = {
  signatories: signatoriesMock,
  initialSignatoriesValues: signatoriesMock,
  handleChange: jest.fn(),
  handleBlur: jest.fn(),
  setFieldValue: jest.fn(),
  arrayHelpers: mockArrayHelpers,
  isForm: true,
  editModes: {},
  setEditModes: jest.fn(),
};

describe('CertificateSignatories', () => {
  beforeEach(() => {
    initializeMocks();

    mockUseEditSignatory.mockReturnValue({
      toggleEditSignatory: jest.fn(),
      handleDeleteSignatory: jest.fn(),
      handleCancelUpdateSignatory: jest.fn(),
    });

    mockUseCreateSignatory.mockReturnValue({
      handleAddSignatory: jest.fn(),
    });
  });

  it('renders signatory components for each signatory', () => {
    renderComponent({ ...defaultProps, isForm: false });

    signatoriesMock.forEach(signatory => {
      expect(screen.getByText(signatory.name)).toBeInTheDocument();
      expect(screen.getByText(signatory.title)).toBeInTheDocument();
      expect(screen.getByText(signatory.organization)).toBeInTheDocument();
    });
  });

  it('adds a new signatory when add button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent({ ...defaultProps, isForm: true });

    await user.click(screen.getByText(messages.addSignatoryButton.defaultMessage));
    expect(mockUseCreateSignatory.mock.results[0].value.handleAddSignatory).toHaveBeenCalled();
  });
});

describe('CertificateSignatories - real useEditSignatory', () => {
  beforeEach(() => {
    initializeMocks();

    // Use the real implementation so handleDeleteSignatory actually calls arrayHelpers.remove
    const realUseEditSignatory = jest.requireActual('./hooks/useEditSignatory').default;
    mockUseEditSignatory.mockImplementation(realUseEditSignatory);

    mockUseCreateSignatory.mockReturnValue({
      handleAddSignatory: jest.fn(),
    });
  });

  it('calls remove for the correct signatory when delete is confirmed', async () => {
    const user = userEvent.setup();
    renderComponent(defaultProps);

    const deleteIcons = screen.getAllByRole('button', { name: commonMessages.deleteTooltip.defaultMessage });
    expect(deleteIcons.length).toBe(signatoriesMock.length);

    await user.click(deleteIcons[0]);

    // The delete icon opens a confirmation modal; confirm the deletion
    const dialog = await screen.findByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', { name: commonMessages.deleteTooltip.defaultMessage });
    await user.click(confirmButton);

    expect(mockArrayHelpers.remove).toHaveBeenCalledWith(0);
  });
});

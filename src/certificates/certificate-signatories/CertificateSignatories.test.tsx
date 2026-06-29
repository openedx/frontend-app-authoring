import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import { signatoriesMock } from '../__mocks__';
import commonMessages from '../messages';
import messages from './messages';
import useEditSignatory from './hooks/useEditSignatory';
import useCreateSignatory from './hooks/useCreateSignatory';

const mockUseEditSignatory = jest.mocked(useEditSignatory);
const mockUseCreateSignatory = jest.mocked(useCreateSignatory);
import CertificateSignatories from './CertificateSignatories';

const mockArrayHelpers = {
  push: jest.fn(),
  remove: jest.fn(),
};

jest.mock('./hooks/useEditSignatory');

jest.mock('./hooks/useCreateSignatory');

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

  it.skip('calls remove for the correct signatory when delete icon is clicked', async () => {
    const user = userEvent.setup();
    renderComponent(defaultProps);

    const deleteIcons = screen.getAllByRole('button', { name: commonMessages.deleteTooltip.defaultMessage });
    expect(deleteIcons.length).toBe(signatoriesMock.length);

    await user.click(deleteIcons[0]);

    // FIXME: this isn't called because the whole 'useEditSignatory' hook
    // which calls it is mocked out.
    expect(mockArrayHelpers.remove).toHaveBeenCalledWith(0);
  });
});

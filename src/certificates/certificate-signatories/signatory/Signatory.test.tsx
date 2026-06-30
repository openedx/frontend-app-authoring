import { initializeMocks, render, screen, userEvent } from '@src/testUtils';

import { signatoriesMock } from '../../__mocks__';
import commonMessages from '../../messages';
import messages from '../messages';
import Signatory from './Signatory';

const mockHandleEdit = jest.fn();

const renderSignatory = (props) =>
  render(
    <Signatory {...props} />,
  );

const defaultProps = { ...signatoriesMock[0], handleEdit: mockHandleEdit, index: 0 };

describe('Signatory Component', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders signatory data in view mode', () => {
    renderSignatory(defaultProps);
    const signatureImage = screen.getByAltText(messages.imageLabel.defaultMessage);
    const sectionTitle = screen.getByRole('heading', {
      level: 3,
      name: `${messages.signatoryTitle.defaultMessage} ${defaultProps.index + 1}`,
    });

    expect(sectionTitle).toBeInTheDocument();
    expect(screen.getByText(defaultProps.name, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.title, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.organization, { exact: false })).toBeInTheDocument();
    expect(signatureImage).toBeInTheDocument();
    expect(signatureImage).toHaveAttribute('src', expect.stringContaining(defaultProps.signatureImagePath));
    expect(screen.queryByText(messages.namePlaceholder.defaultMessage)).not.toBeInTheDocument();
  });

  it('calls handleEdit when the edit button is clicked', async () => {
    const user = userEvent.setup();
    renderSignatory(defaultProps);

    const editButton = screen.getByRole('button', { name: commonMessages.editTooltip.defaultMessage });
    await user.click(editButton);

    expect(mockHandleEdit).toHaveBeenCalled();
  });
});

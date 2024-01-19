import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';

import { signatoriesMock } from '../../__mocks__';
import commonMessages from '../../messages';
import messages from '../messages';
import Signatory from './Signatory';

const mockHandleEdit = jest.fn();

const renderSignatory = (props) => render(
  <IntlProvider locale="en">
    <Signatory {...props} />
  </IntlProvider>,
);

const defaultProps = { ...signatoriesMock[0], handleEdit: mockHandleEdit, index: 0 };

describe('Signatory Component', () => {
  it('renders in MODE_STATES.view mode', () => {
    const {
      getByText, queryByText, getByAltText, getByRole,
    } = renderSignatory(defaultProps);
    const signatureImage = getByAltText(messages.imageLabel.defaultMessage);
    const sectionTitle = getByRole('heading', { level: 3, name: `${messages.signatoryTitle.defaultMessage} ${defaultProps.index + 1}` });

    expect(sectionTitle).toBeInTheDocument();
    expect(getByText(defaultProps.name)).toBeInTheDocument();
    expect(getByText(defaultProps.title)).toBeInTheDocument();
    expect(getByText(defaultProps.organization)).toBeInTheDocument();
    expect(signatureImage).toBeInTheDocument();
    expect(signatureImage).toHaveAttribute('src', expect.stringContaining(defaultProps.signatureImagePath));
    expect(queryByText(messages.namePlaceholder.defaultMessage)).not.toBeInTheDocument();
  });

  it('calls handleEdit when the edit button is clicked', () => {
    const { getByRole } = renderSignatory(defaultProps);

    const editButton = getByRole('button', { name: commonMessages.editTooltip.defaultMessage });
    userEvent.click(editButton);

    expect(mockHandleEdit).toHaveBeenCalled();
  });
});

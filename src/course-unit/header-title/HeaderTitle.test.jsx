import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import HeaderTitle from './HeaderTitle';
import messages from './messages';

const unitTitle = 'Getting Started';
const isTitleEditFormOpen = false;
const handleTitleEdit = jest.fn();
const handleTitleEditSubmit = jest.fn();

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <HeaderTitle
      unitTitle={unitTitle}
      isTitleEditFormOpen={isTitleEditFormOpen}
      handleTitleEdit={handleTitleEdit}
      handleTitleEditSubmit={handleTitleEditSubmit}
      {...props}
    />
  </IntlProvider>,
);

describe('<HeaderTitle />', () => {
  it('render HeaderTitle component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(unitTitle)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeInTheDocument();
  });

  it('render HeaderTitle with open edit form', () => {
    const { getByRole } = renderComponent({
      isTitleEditFormOpen: true,
    });

    expect(getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage })).toHaveValue(unitTitle);
    expect(getByRole('button', { name: messages.altButtonEdit.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.altButtonSettings.defaultMessage })).toBeInTheDocument();
  });

  it('calls toggle edit title form by clicking on Edit button', () => {
    const { getByRole } = renderComponent();

    const editTitleButton = getByRole('button', { name: messages.altButtonEdit.defaultMessage });
    userEvent.click(editTitleButton);
    expect(handleTitleEdit).toHaveBeenCalledTimes(1);
  });

  it('calls saving title by clicking outside or press Enter key', async () => {
    const { getByRole } = renderComponent({
      isTitleEditFormOpen: true,
    });

    const titleField = getByRole('textbox', { name: messages.ariaLabelButtonEdit.defaultMessage });
    userEvent.type(titleField, ' 1');
    expect(titleField).toHaveValue(`${unitTitle} 1`);
    userEvent.click(document.body);
    expect(handleTitleEditSubmit).toHaveBeenCalledTimes(1);

    userEvent.click(titleField);
    userEvent.type(titleField, ' 2[Enter]');
    expect(titleField).toHaveValue(`${unitTitle} 1 2`);
    expect(handleTitleEditSubmit).toHaveBeenCalledTimes(2);
  });
});

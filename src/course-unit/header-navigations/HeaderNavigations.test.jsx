import { fireEvent, render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { COURSE_BLOCK_NAMES } from '../../constants';
import HeaderNavigations from './HeaderNavigations';
import messages from './messages';

const handleViewLiveFn = jest.fn();
const handlePreviewFn = jest.fn();
const handleEditFn = jest.fn();

const headerNavigationsActions = {
  handleViewLive: handleViewLiveFn,
  handlePreview: handlePreviewFn,
  handleEdit: handleEditFn,
};

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <HeaderNavigations
      category={COURSE_BLOCK_NAMES.vertical.id}
      headerNavigationsActions={headerNavigationsActions}
      {...props}
    />
  </IntlProvider>,
);

describe('<HeaderNavigations />', () => {
  it('render HeaderNavigations component correctly', () => {
    const { getByRole } = renderComponent({ unitCategory: COURSE_BLOCK_NAMES.vertical.id });

    expect(getByRole('button', { name: messages.viewLiveButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.previewButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the correct handlers when clicking buttons for unit page', () => {
    const { getByRole, queryByRole } = renderComponent({ unitCategory: COURSE_BLOCK_NAMES.vertical.id });

    const viewLiveButton = getByRole('button', { name: messages.viewLiveButton.defaultMessage });
    fireEvent.click(viewLiveButton);
    expect(handleViewLiveFn).toHaveBeenCalledTimes(1);

    const previewButton = getByRole('button', { name: messages.previewButton.defaultMessage });
    fireEvent.click(previewButton);
    expect(handlePreviewFn).toHaveBeenCalledTimes(1);

    const editButton = queryByRole('button', { name: messages.editButton.defaultMessage });
    expect(editButton).not.toBeInTheDocument();
  });

  ['libraryContent', 'splitTest'].forEach((category) => {
    it(`calls the correct handlers when clicking buttons for ${category} page`, () => {
      const { getByRole, queryByRole } = renderComponent({ category: COURSE_BLOCK_NAMES[category].id });

      const editButton = getByRole('button', { name: messages.editButton.defaultMessage });
      fireEvent.click(editButton);
      expect(handleViewLiveFn).toHaveBeenCalledTimes(1);

      [messages.viewLiveButton.defaultMessage, messages.previewButton.defaultMessage].forEach((btnName) => {
        expect(queryByRole('button', { name: btnName })).not.toBeInTheDocument();
      });
    });
  });
});

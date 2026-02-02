import userEvent from '@testing-library/user-event';
import { render, initializeMocks, screen } from '@src/testUtils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { COURSE_BLOCK_NAMES } from '../../constants';
import HeaderNavigations from './HeaderNavigations';
import messages from './messages';
import { UnitSidebarProvider } from '../unit-sidebar/UnitSidebarContext';

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
  {
    extraWrapper: UnitSidebarProvider,
  },
);

describe('<HeaderNavigations />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render HeaderNavigations component correctly', () => {
    renderComponent({ unitCategory: COURSE_BLOCK_NAMES.vertical.id });

    expect(screen.getByRole('button', { name: messages.viewLiveButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.previewButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the correct handlers when clicking buttons for unit page', async () => {
    const user = userEvent.setup();
    renderComponent({ unitCategory: COURSE_BLOCK_NAMES.vertical.id });

    const viewLiveButton = screen.getByRole('button', { name: messages.viewLiveButton.defaultMessage });
    await user.click(viewLiveButton);
    expect(handleViewLiveFn).toHaveBeenCalledTimes(1);

    const previewButton = screen.getByRole('button', { name: messages.previewButton.defaultMessage });
    await user.click(previewButton);
    expect(handlePreviewFn).toHaveBeenCalledTimes(1);

    const editButton = screen.queryByRole('button', { name: messages.editButton.defaultMessage });
    expect(editButton).not.toBeInTheDocument();
  });

  ['libraryContent', 'splitTest'].forEach((category) => {
    it(`calls the correct handlers when clicking buttons for ${category} page`, async () => {
      const user = userEvent.setup();
      renderComponent({ category: COURSE_BLOCK_NAMES[category].id });

      const editButton = await screen.findByRole('button', { name: messages.editButton.defaultMessage });
      await user.click(editButton);
      expect(handleEditFn).toHaveBeenCalledTimes(1);

      [messages.viewLiveButton.defaultMessage, messages.previewButton.defaultMessage].forEach((btnName) => {
        expect(screen.queryByRole('button', { name: btnName })).not.toBeInTheDocument();
      });
    });
  });
});

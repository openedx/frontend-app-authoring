import { fireEvent, render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import HeaderNavigations from './HeaderNavigations';
import messages from './messages';

const handleViewLiveFn = jest.fn();
const handlePreviewFn = jest.fn();
const headerNavigationsActions = {
  handleViewLive: handleViewLiveFn,
  handlePreview: handlePreviewFn,
};

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <HeaderNavigations
      headerNavigationsActions={headerNavigationsActions}
      {...props}
    />
  </IntlProvider>,
);

describe('<HeaderNavigations />', () => {
  it('render HeaderNavigations component correctly', () => {
    const { getByRole } = renderComponent();

    expect(getByRole('button', { name: messages.viewLiveButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.previewButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the correct handlers when clicking buttons', () => {
    const { getByRole } = renderComponent();

    const viewLiveButton = getByRole('button', { name: messages.viewLiveButton.defaultMessage });
    fireEvent.click(viewLiveButton);
    expect(handleViewLiveFn).toHaveBeenCalledTimes(1);

    const previewButton = getByRole('button', { name: messages.previewButton.defaultMessage });
    fireEvent.click(previewButton);
    expect(handlePreviewFn).toHaveBeenCalledTimes(1);
  });
});

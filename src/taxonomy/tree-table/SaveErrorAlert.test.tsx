import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';

import SaveErrorAlert from './SaveErrorAlert';

const wrapper = ({ children }: { children: React.ReactNode; }) => (
  <IntlProvider locale="en" messages={{}}>{children}</IntlProvider>
);

describe('SaveErrorAlert', () => {
  it('stays closed when only a draft error is present and delete-error state is omitted', () => {
    render(
      <SaveErrorAlert
        draftError="Delete failed"
        isError={false}
        isUpdateError={false}
      />,
      { wrapper },
    );

    expect(screen.queryByText('Error saving changes')).not.toBeInTheDocument();
  });

  it('opens for delete errors and reopens when a new delete failure arrives', () => {
    const { rerender } = render(
      <SaveErrorAlert
        draftError="First delete failure"
        isError={false}
        isUpdateError={false}
        isDeleteError
      />,
      { wrapper },
    );

    expect(screen.getByText('Error saving changes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText('Error saving changes')).not.toBeInTheDocument();

    rerender(
      <SaveErrorAlert
        draftError="Second delete failure"
        isError={false}
        isUpdateError={false}
        isDeleteError
      />,
    );

    expect(screen.getByText('Error saving changes')).toBeInTheDocument();
    expect(screen.getByText('Second delete failure. Please try again.')).toBeInTheDocument();
  });
});

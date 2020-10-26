import { injectIntl } from '@edx/frontend-platform/i18n';
import React from 'react';
import {
  fireEvent, getByLabelText, getByRole, getByText, waitFor,
} from '@testing-library/dom';
import { RawLibraryAccessFormContainer } from '../LibraryAccessForm';
import {
  ctxRender,
  immediate,
  mocksFromNames,
  testSuite,
} from '../../common/specs/helpers';
import { libraryFactory, userFactory } from '../../common/specs/factories';
import { LIBRARY_ACCESS } from '../../common/data';

const LibraryAccessFormContainer = injectIntl(RawLibraryAccessFormContainer);

function commonMocks() {
  return mocksFromNames(['clearAccessErrors', 'addUser', 'setShowAdd']);
}

testSuite('<LibraryAccessForm />', () => {
  it('Renders an error for the email field', async () => {
    const library = libraryFactory();
    const props = { library, errorFields: { email: 'Too difficult to remember.' }, ...commonMocks() };
    const { container } = await ctxRender(<LibraryAccessFormContainer {...props} />);
    expect(getByText(container, /Too difficult/)).toBeTruthy();
  });
  it('Submits and adds a new user.', async () => {
    const library = libraryFactory();
    const props = { library, ...commonMocks() };
    const { addUser } = props;
    const user = userFactory();
    addUser.mockImplementation(() => immediate(user));
    const { container } = await ctxRender(<LibraryAccessFormContainer {...props} />);
    const emailField = getByLabelText(container, 'Email');
    fireEvent.change(emailField, { target: { value: 'boop@beep.com' } });
    const submitButton = getByRole(container, 'button', { name: /Submit/ });
    fireEvent.click(submitButton);
    await waitFor(() => expect(addUser).toHaveBeenCalledWith({
      libraryId: library.id, data: { email: 'boop@beep.com', access_level: LIBRARY_ACCESS.READ },
    }));
    expect(emailField.value).toBe('');
  });
  it('Closes out', async () => {
    const library = libraryFactory();
    const props = { library, ...commonMocks() };
    const { setShowAdd } = props;
    const { container } = await ctxRender(
      <LibraryAccessFormContainer
        {...props}
      />,
    );
    const button = getByRole(container, 'button', { name: /Cancel/ });
    fireEvent.click(button);
    expect(setShowAdd).toHaveBeenCalledWith(false);
  });
});

import * as React from 'react';
import { screen } from '@testing-library/react';
import { injectIntl } from '@edx/frontend-platform/i18n';
import {
  getByRole, getByText, queryAllByRole, queryAllByText,
} from '@testing-library/dom';
import { UserAccessWidgetContainerBase } from '../UserAccessWidget';
import { ctxRender, mocksFromNames, testSuite } from '../../common/specs/helpers';
import { libraryFactoryLine, userFactoryLine } from '../../common/specs/factories';
import { LIBRARY_ACCESS } from '../../common/data';

function commonMocks() {
  return mocksFromNames([
    'setUserAccess', 'removeUserAccess',
  ]);
}

const UserAccessWidgetContainer = injectIntl(UserAccessWidgetContainerBase);

testSuite('<UserAccessWidgetContainer />', () => {
  [
    [LIBRARY_ACCESS.READ, 'Read Only'],
    [LIBRARY_ACCESS.ADMIN, 'Admin'],
    [LIBRARY_ACCESS.AUTHOR, 'Author'],
  ].forEach(([accessLevel, text]) => {
    it(`Should render a badge labeled ${text} when the target user's access level is ${accessLevel}.`, async () => {
      const [library] = libraryFactoryLine();
      // userId doesn't exist on users pulled from the team listings, but it does exist on authenticated users.
      const [user, currentUser] = userFactoryLine([{ access_level: accessLevel }, { userId: 3 }]);
      const props = {
        library, user, multipleAdmins: false, ...commonMocks(),
      };
      await ctxRender(
        <UserAccessWidgetContainer
          {...props}
        />,
        { context: { authenticatedUser: currentUser } },
      );
      const badge = screen.getByText(text);
      expect(badge).toBeTruthy();
    });
  });

  [
    [true, LIBRARY_ACCESS.ADMIN, false, false],
    [true, LIBRARY_ACCESS.ADMIN, true, true],
    [true, LIBRARY_ACCESS.AUTHOR, true, false],
    [true, LIBRARY_ACCESS.AUTHOR, false, false],
    [true, LIBRARY_ACCESS.READ, true, false],
    [true, LIBRARY_ACCESS.READ, false, false],
    [false, LIBRARY_ACCESS.ADMIN, true, false],
    [false, LIBRARY_ACCESS.ADMIN, false, false],
  ].forEach(async ([isAdmin, accessLevel, multipleAdmins, buttonsShown]) => {
    let testName = 'The admin privilege management buttons are ';
    if (!buttonsShown) {
      testName += 'not ';
    }
    testName += 'shown when the viewer is ';
    if (!isAdmin) {
      testName += 'not ';
    }
    testName += `an admin and the subject's access level is ${accessLevel} and there are `;
    if (!multipleAdmins) {
      testName += 'multiple admins.';
    }

    it(testName, async () => {
      const [library] = libraryFactoryLine();
      const [currentUser, targetUser] = userFactoryLine([{}, { access_level: accessLevel }]);
      const props = {
        library, user: targetUser, multipleAdmins, isAdmin, ...commonMocks(),
      };
      const { container } = await ctxRender(
        <UserAccessWidgetContainer
          {...props}
        />,
        { context: { authenticatedUser: currentUser } },
      );
      if (buttonsShown) {
        const removeButton = getByRole(container, 'button', { name: /Remove Admin/ });
        expect(removeButton).toBeTruthy();
      } else {
        const buttonList = queryAllByRole(container, 'button', { name: /Remove Admin/ });
        expect(buttonList.length).toBe(0);
        if (isAdmin && targetUser.access_level === LIBRARY_ACCESS.ADMIN) {
          expect(getByText(container, /Promote another member/)).toBeTruthy();
        } else {
          expect(queryAllByText(container, /Promote another member/).length).toBe(0);
        }
      }
    });
  });

  [
    [true, LIBRARY_ACCESS.ADMIN, false],
    [true, LIBRARY_ACCESS.AUTHOR, true],
    [true, LIBRARY_ACCESS.READ, false],
    [false, LIBRARY_ACCESS.AUTHOR, false],
  ].forEach(async ([isAdmin, accessLevel, buttonsShown]) => {
    let testName = 'The staff management buttons are ';
    if (!buttonsShown) {
      testName += 'not ';
    }
    testName += 'visible when the viewer is ';
    if (!isAdmin) {
      testName += 'not ';
    }
    testName += `an admin and the subject's current access_level is ${accessLevel}.`;

    it(testName, async () => {
      const [library] = libraryFactoryLine();
      const [currentUser, targetUser] = userFactoryLine([{}, { access_level: accessLevel }]);
      const props = {
        library, user: targetUser, multipleAdmins: false, isAdmin, ...commonMocks(),
      };
      const { container } = await ctxRender(
        <UserAccessWidgetContainer
          {...props}
        />,
        { context: { authenticatedUser: currentUser } },
      );
      if (buttonsShown) {
        const removeButton = getByRole(container, 'button', { name: /Remove Author/ });
        expect(removeButton).toBeTruthy();
        const addButton = getByRole(container, 'button', { name: /Add Admin/ });
        expect(addButton).toBeTruthy();
      } else {
        const buttonList = queryAllByRole(container, 'button', { name: /(Remove Author|Add Admin)/ });
        expect(buttonList.length).toBe(0);
      }
    });
  });

  [
    [true, LIBRARY_ACCESS.ADMIN, false],
    [true, LIBRARY_ACCESS.AUTHOR, false],
    [true, LIBRARY_ACCESS.READ, true],
    [false, LIBRARY_ACCESS.READ, false],
  ].forEach(async ([isAdmin, accessLevel, buttonShown]) => {
    let testName = 'The add author privileges button is ';
    if (!buttonShown) {
      testName += 'not ';
    }
    testName += 'visible if the viewer is ';
    if (!isAdmin) {
      testName += 'not ';
    }
    testName += `an admin and the subject's access level is ${accessLevel}.`;

    it(testName, async () => {
      const [library] = libraryFactoryLine();
      const [currentUser, targetUser] = userFactoryLine([{}, { access_level: accessLevel }]);
      const props = {
        library, user: targetUser, multipleAdmins: false, isAdmin, ...commonMocks(),
      };
      const { container } = await ctxRender(
        <UserAccessWidgetContainer
          {...props}
        />,
        { context: { authenticatedUser: currentUser } },
      );
      const buttonList = queryAllByRole(container, 'button', { name: /Add Author/ });
      if (buttonShown) {
        expect(buttonList.length).toBe(1);
      } else {
        expect(buttonList.length).toBe(0);
      }
    });
  });

  [
    [true, LIBRARY_ACCESS.ADMIN, false, false],
    [true, LIBRARY_ACCESS.ADMIN, true, true],
    [true, LIBRARY_ACCESS.AUTHOR, true, true],
    [true, LIBRARY_ACCESS.AUTHOR, false, true],
    [true, LIBRARY_ACCESS.READ, true, true],
    [true, LIBRARY_ACCESS.READ, false, true],
    [false, LIBRARY_ACCESS.ADMIN, true, false],
    [false, LIBRARY_ACCESS.ADMIN, false, false],
    [false, LIBRARY_ACCESS.AUTHOR, true, false],
    [false, LIBRARY_ACCESS.AUTHOR, false, false],
    [false, LIBRARY_ACCESS.READ, true, false],
    [false, LIBRARY_ACCESS.READ, false, false],
  ].forEach(([isAdmin, accessLevel, multipleAdmins, buttonShown]) => {
    let testName = 'The button for removing a user is ';
    if (buttonShown) {
      testName += 'present';
    } else {
      testName += 'not present';
    }
    testName += ' when the viewer is ';
    if (!isAdmin) {
      testName += 'not ';
    }
    testName += 'an admin and there are ';
    if (!multipleAdmins) {
      testName += ' not ';
    }
    testName += 'multiple admins in a library.';

    it(testName, async () => {
      const [library] = libraryFactoryLine();
      const [currentUser, targetUser] = userFactoryLine([{}, { access_level: accessLevel }]);
      const props = {
        library, user: targetUser, multipleAdmins, isAdmin, ...commonMocks(),
      };
      const { container } = await ctxRender(
        <UserAccessWidgetContainer
          {...props}
        />,
        { context: { authenticatedUser: currentUser } },
      );
      const buttonList = queryAllByRole(container, 'button', { name: /Remove user/ });
      if (buttonShown) {
        expect(buttonList.length).toBe(1);
      } else {
        expect(buttonList.length).toBe(0);
      }
    });
  });
});

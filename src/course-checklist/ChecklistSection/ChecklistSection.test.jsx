/* eslint-disable */
import {
  render,
  within,
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../store';
import { initialState,generateCourseLaunchData } from '../factories/mockApiResponses';
import messages from './messages';
import ChecklistSection from './index';
import { checklistItems } from './utils/courseChecklistData';
import getUpdateLinks from '../utils';

const testData = camelCaseObject(generateCourseLaunchData());


const defaultProps = {
  data: testData,
  dataHeading: 'Test checklist',
  idPrefix: 'launchChecklist',
  updateLinks: getUpdateLinks('courseId'),
  isLoading: false,
};

const testChecklistData = checklistItems[defaultProps.idPrefix];

const completedItemIds = ['welcomeMessage', 'courseDates']

const renderComponent = (props) => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <ChecklistSection {...props} />
      </AppProvider>
    </IntlProvider>,
  );
};

let store;

describe('ChecklistSection', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: [],
      },
    });
    store = initializeStore(initialState);
  });

  it('a heading using the dataHeading prop', () => {
    renderComponent(defaultProps);

    expect(screen.getByText(defaultProps.dataHeading)).toBeVisible();
  });

  it('completion count text', () => {
    renderComponent(defaultProps);
    const completionText = `${completedItemIds.length}/6 completed`;
    expect(screen.getByTestId('completion-subheader').textContent).toEqual(completionText);
  });

  it('a loading spinner when isLoading prop is true', () => {
    renderComponent({ ...defaultProps, isLoading: true });

    const completionSubheader = screen.queryByTestId('completion-subheader');
    expect(completionSubheader).toBeNull();

    const loadingSpinner = screen.getByTestId('loading-spinner');
    expect(loadingSpinner).toBeVisible();
  });

  it('the correct number of checks', () => {
    renderComponent(defaultProps);

    const listItems = screen.getAllByTestId('checklist-item', { exact: false });
    expect(listItems).toHaveLength(6);
  });

  it('welcomeMessage comment section should be null', () => {
    renderComponent(defaultProps);

    const comment = screen.getByTestId('comment-section-welcomeMessage');
    expect(comment.children).toHaveLength(0);
  });

  it('certificate comment section should be null', () => {
    renderComponent(defaultProps);

    const comment = screen.getByTestId('comment-section-certificate');
    expect(comment.children).toHaveLength(0);
  });

  it('courseDates comment section should be null', () => {
    renderComponent(defaultProps);

    const comment = screen.getByTestId('comment-section-courseDates');
    expect(comment.children).toHaveLength(0);
  });

  it('proctoringEmail comment section should be null', () => {
    renderComponent(defaultProps);

    const comment = screen.getByTestId('comment-section-proctoringEmail');
    expect(comment.children).toHaveLength(0);
  });

  describe('gradingPolicy comment section', () => {
    it('should be null if sum of weights is equal to 1', () => {
      const props = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          grades: {
            ...defaultProps.data.grades,
            sumOfWeights: 1,
          }
        },
      };
      renderComponent(props);

      const comment = screen.getByTestId('comment-section-gradingPolicy');
      expect(comment.children).toHaveLength(0);
    });

    it('should have comment section', () => {
      renderComponent(defaultProps);

      const comment = screen.getByTestId('comment-section-gradingPolicy');
      expect(comment.children).toHaveLength(1);

      expect(screen.getByText(
        'Your current grading policy adds up to',
        { exact: false },
      )).toBeVisible();
    });
  });

  describe('assignmentDeadlines comment section', () => {
    it('should be null if assignments with dates before start and after end are empty', () => {
      const props = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          assignments: {
            ...defaultProps.data.assignments,
            assignmentsWithDatesAfterEnd: [],
            assignmentsWithOraDatesBeforeStart: [],
          }
        },
      };
      renderComponent(props);

      const comment = screen.getByTestId('comment-section-assignmentDeadlines');
      expect(comment.children).toHaveLength(0);
    });

    it('should have comment section', () => {
      renderComponent(defaultProps);

      const comment = screen.getByTestId('comment-section-assignmentDeadlines');
      const assigmentLinks = within(comment).getAllByRole('link');

      expect(comment.children).toHaveLength(1);

      expect(screen.getByText(
        messages.assignmentDeadlinesComment.defaultMessage,
        { exact: false },
      )).toBeVisible();

      expect(assigmentLinks).toHaveLength(2);

      expect(assigmentLinks[0].textContent).toEqual('Subsection');

      expect(assigmentLinks[1].textContent).toEqual('ORA subsection');
    });
  });
});    

testChecklistData.forEach((check) => {
  describe(`check with id '${check.id}'`, () => {
    let checkItem;
    beforeEach(() => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      store = initializeStore(initialState);
      renderComponent(defaultProps);
      checkItem = screen.getAllByTestId(`checklist-item-${check.id}`);
    });

    it('renders', () => {
      expect(checkItem).toHaveLength(1);
    });

    it('has correct icon', () => {
      const icon = screen.getAllByTestId(`icon-${check.id}`)

      expect(icon).toHaveLength(1);

      const { queryByTestId } = within(icon[0]);
      if (completedItemIds.includes(check.id)) {
        expect(queryByTestId('completed-icon')).not.toBeNull();
      } else {
        expect(queryByTestId('uncompleted-icon')).not.toBeNull();
      }
    });

    it('has correct short description', () => {
      const { getByText } = within(checkItem[0]);
      const shortDescription = messages[`${check.id}ShortDescription`].defaultMessage;
      expect(getByText(shortDescription)).toBeVisible();
    });

    it('has correct long description', () => {
      const { getByText } = within(checkItem[0]);
      const longDescription = messages[`${check.id}LongDescription`].defaultMessage;
      expect(getByText(longDescription)).toBeVisible();
    });

    describe('has correct link', () => {
      const links = getUpdateLinks('courseId')
      const shouldShowLink = Object.keys(links).includes(check.id);

      if (shouldShowLink) {
        it('with a Hyperlink', () => {
          const { getByRole, getByText } = within(checkItem[0]);

          expect(getByText('Update')).toBeVisible();

          expect(getByRole('link').href).toMatch(links[check.id]);
        });
      } else {
        it('without a Hyperlink', () => {
          const { queryByText } = within(checkItem[0]);

          expect(queryByText('Update')).toBeNull();
        });
      }
    });
  });
});

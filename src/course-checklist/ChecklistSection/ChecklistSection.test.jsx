import { camelCaseObject } from '@edx/frontend-platform';

import {
  initializeMocks, render, screen, within,
} from '../../testUtils';
import { getApiWaffleFlagsUrl } from '../../data/api';
import { fetchWaffleFlags } from '../../data/thunks';
import { generateCourseLaunchData } from '../factories/mockApiResponses';
import { executeThunk } from '../../utils';
import { checklistItems } from './utils/courseChecklistData';
import messages from './messages';

import ChecklistSection from '.';

const testData = camelCaseObject(generateCourseLaunchData());

const courseId = '123';

const defaultProps = {
  courseId,
  data: testData,
  dataHeading: 'Test checklist',
  idPrefix: 'launchChecklist',
  isLoading: false,
};

const testChecklistData = checklistItems[defaultProps.idPrefix];

const completedItemIds = ['welcomeMessage', 'courseDates'];

const renderComponent = (props) => {
  render(<ChecklistSection {...props} />);
};

describe('ChecklistSection', () => {
  beforeEach(async () => {
    const { axiosMock, reduxStore } = initializeMocks();
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, {
        useNewGradingPage: true,
        useNewCertificatesPage: true,
        useNewScheduleDetailsPage: true,
        useNewCourseOutlinePage: true,
      });
    await executeThunk(fetchWaffleFlags(courseId), reduxStore.dispatch);
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
          },
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
          },
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

  describe('Checklist Component', () => {
    let checklistData;
    let updateLinks;

    beforeEach(() => {
      renderComponent(defaultProps);

      checklistData = testChecklistData.map((item) => ({
        itemId: item.id,
        checklistItem: screen.getAllByTestId(`checklist-item-${item.id}`),
        icon: screen.getAllByTestId(`icon-${item.id}`),
        shortDescription: messages[`${item.id}ShortDescription`].defaultMessage,
        longDescription: messages[`${item.id}LongDescription`].defaultMessage,
      }));

      updateLinks = screen.getAllByTestId('update-link');
    });

    it('should display the correct icons based on completion status', () => {
      checklistData.forEach(({ itemId, icon }) => {
        const { queryByTestId } = within(icon[0]);

        if (completedItemIds.includes(itemId)) {
          expect(queryByTestId('completed-icon')).not.toBeNull();
        } else {
          expect(queryByTestId('uncompleted-icon')).not.toBeNull();
        }
      });
    });

    it('should display short and long descriptions for each checklist item', () => {
      checklistData.forEach(({ checklistItem, shortDescription, longDescription }) => {
        const { getByText } = within(checklistItem[0]);

        expect(getByText(shortDescription)).toBeVisible();
        expect(getByText(longDescription)).toBeVisible();
      });
    });

    it('should have valid update links for each checklist item', () => {
      checklistData.forEach(({ itemId }) => {
        updateLinks.forEach((link) => {
          expect(link).toHaveAttribute('href', updateLinks[itemId]);
        });
      });
    });
  });
});

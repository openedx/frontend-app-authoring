import { camelCaseObject } from '@edx/frontend-platform';

import { useCourseUserPermissions } from '@src/authz/hooks';
import {
  initializeMocks,
  render,
  screen,
  within,
} from '@src/testUtils';

import { generateCourseLaunchData } from '../factories/mockApiResponses';
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

jest.mock('@src/authz/hooks', () => ({
  useCourseUserPermissions: jest.fn(),
}));

/** Every update link is shown by default; tests deny the permissions they are about. */
const mockPermissions = (overrides = {}) =>
  jest.mocked(useCourseUserPermissions).mockReturnValue({
    isLoading: false,
    isAuthzEnabled: true,
    canManageCourseUpdates: true,
    canEditGradingSettings: true,
    canManageCertificates: true,
    canEditSchedule: true,
    canManagePagesAndResources: true,
    ...overrides,
  });

describe('ChecklistSection', () => {
  beforeEach(() => {
    initializeMocks();
    mockPermissions();
  });

  describe('authz validation', () => {
    const updateLinkLabel = messages.updateLinkLabel.defaultMessage;
    const getUpdateLink = (checkId) =>
      within(screen.getByTestId(`checklist-item-${checkId}`)).queryByRole('link', { name: updateLinkLabel });

    it('renders every update link when the user can make changes on all the linked pages', () => {
      renderComponent(defaultProps);

      expect(screen.getAllByRole('link', { name: updateLinkLabel })).toHaveLength(5);
      expect(getUpdateLink('proctoringEmail')).toHaveAttribute(
        'href',
        `/course/${courseId}/pages-and-resources/proctoring/settings`,
      );
    });

    it.each([
      ['welcomeMessage', 'canManageCourseUpdates'],
      ['gradingPolicy', 'canEditGradingSettings'],
      ['certificate', 'canManageCertificates'],
      ['courseDates', 'canEditSchedule'],
      ['proctoringEmail', 'canManagePagesAndResources'],
    ])('hides the %s update link without %s', (checkId, updatePermission) => {
      mockPermissions({ [updatePermission]: false });
      renderComponent(defaultProps);

      expect(screen.getAllByRole('link', { name: updateLinkLabel })).toHaveLength(4);
      expect(getUpdateLink(checkId)).not.toBeInTheDocument();
    });
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

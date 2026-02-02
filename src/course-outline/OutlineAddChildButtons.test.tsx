import userEvent from '@testing-library/user-event';
import { getConfig, setConfig } from '@edx/frontend-platform';
import { ContainerType } from '@src/generic/key-utils';
import {
  initializeMocks, render, screen, waitFor,
} from '@src/testUtils';
import { OutlineFlow, OutlineSidebarProvider } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import OutlineAddChildButtons from './OutlineAddChildButtons';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockReturnValue({ librariesV2Enabled: true }),
}));

const handleAddSection = { mutateAsync: jest.fn() };
const handleAddSubsection = { mutateAsync: jest.fn() };
const handleAddAndOpenUnit = { mutateAsync: jest.fn() };
const handleAddUnit = { mutateAsync: jest.fn() };
const courseUsageKey = 'some/usage/key';
const setCurrentSelection = jest.fn();
jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 5,
    courseUsageKey,
    getUnitUrl: (id: string) => `/some/${id}`,
    handleAddSection,
    handleAddSubsection,
    handleAddAndOpenUnit,
    handleAddUnit,
    setCurrentSelection,
  }),
}));

const startCurrentFlow = jest.fn();
let currentFlow: OutlineFlow | null = null;
jest.mock('@src/course-outline/outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
    startCurrentFlow,
    currentFlow,
    isCurrentFlowOn: !!currentFlow,
  }),
}));

[
  { containerType: ContainerType.Section },
  { containerType: ContainerType.Subsection },
  { containerType: ContainerType.Unit },
].forEach(({ containerType }) => {
  describe(`<OutlineAddChildButtons> for ${containerType}`, () => {
    beforeEach(() => {
      initializeMocks();
      setConfig({
        ...getConfig(),
        ENABLE_COURSE_OUTLINE_NEW_DESIGN: 'true',
      });
    });

    it('renders and behaves correctly', async () => {
      const newClickHandler = jest.fn();
      const useFromLibClickHandler = jest.fn();
      render(<OutlineAddChildButtons
        handleNewButtonClick={newClickHandler}
        handleUseFromLibraryClick={useFromLibClickHandler}
        childType={containerType}
        parentLocator=""
      />, { extraWrapper: OutlineSidebarProvider });

      const newBtn = await screen.findByRole('button', { name: `New ${containerType}` });
      expect(newBtn).toBeInTheDocument();
      const useBtn = await screen.findByRole('button', { name: `Use ${containerType} from library` });
      expect(useBtn).toBeInTheDocument();
      await userEvent.click(newBtn);
      await waitFor(() => expect(newClickHandler).toHaveBeenCalled());
      await userEvent.click(useBtn);
      await waitFor(() => expect(useFromLibClickHandler).toHaveBeenCalled());
    });

    it('calls appropriate new handlers', async () => {
      const parentLocator = `parent-of-${containerType}`;
      render(<OutlineAddChildButtons
        childType={containerType}
        parentLocator={parentLocator}
      />, { extraWrapper: OutlineSidebarProvider });

      const newBtn = await screen.findByRole('button', { name: `New ${containerType}` });
      expect(newBtn).toBeInTheDocument();
      await userEvent.click(newBtn);
      switch (containerType) {
        case ContainerType.Section:
          await waitFor(() => expect(handleAddSection.mutateAsync).toHaveBeenCalledWith({
            type: ContainerType.Chapter,
            parentLocator: courseUsageKey,
            displayName: 'Section',
          }));
          break;
        case ContainerType.Subsection:
          await waitFor(() => expect(handleAddSubsection.mutateAsync).toHaveBeenCalledWith({
            type: ContainerType.Sequential,
            parentLocator,
            displayName: 'Subsection',
          }));
          break;
        case ContainerType.Unit:
          await waitFor(() => expect(handleAddAndOpenUnit.mutateAsync).toHaveBeenCalledWith({
            type: ContainerType.Vertical,
            parentLocator,
            displayName: 'Unit',
          }));
          break;
        default:
          throw new Error(`Unknown container type: ${containerType}`);
      }
    });

    it('calls appropriate use handlers', async () => {
      const parentLocator = `parent-of-${containerType}`;
      render(<OutlineAddChildButtons
        childType={containerType}
        parentLocator={parentLocator}
      />, { extraWrapper: OutlineSidebarProvider });
      const useBtn = await screen.findByRole('button', { name: `Use ${containerType} from library` });
      expect(useBtn).toBeInTheDocument();
      await userEvent.click(useBtn);
      await waitFor(() => expect(startCurrentFlow).toHaveBeenCalledWith({
        flowType: containerType,
        parentLocator,
      }));
    });

    it('shows appropriate static placeholder', async () => {
      const parentLocator = `parent-of-${containerType}`;
      currentFlow = {
        flowType: containerType,
        parentLocator,
      };
      render(<OutlineAddChildButtons
        childType={containerType}
        parentLocator={parentLocator}
      />, { extraWrapper: OutlineSidebarProvider });
      // should show placeholder when use button is clicked
      expect(await screen.findByRole('heading', {
        name: new RegExp(`Adding Library ${containerType}`, 'i'),
      })).toBeInTheDocument();
    });
  });
});

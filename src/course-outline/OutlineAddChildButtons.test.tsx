import userEvent from '@testing-library/user-event';
import { getConfig, setConfig } from '@edx/frontend-platform';
import { ContainerType } from '@src/generic/key-utils';
import {
  initializeMocks, render, screen, waitFor,
} from '@src/testUtils';
import { OutlineSidebarProvider } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import OutlineAddChildButtons from './OutlineAddChildButtons';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockReturnValue({ librariesV2Enabled: true }),
}));

const handleAddSection = { mutateAsync: jest.fn() };
const handleAddSubsection = { mutateAsync: jest.fn() };
const handleAddUnit = { mutateAsync: jest.fn() };
jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 5,
    getUnitUrl: (id: string) => `/some/${id}`,
    handleAddSection,
    handleAddSubsection,
    handleAddUnit,
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
    });

    it('renders and behaves correctly', async () => {
      setConfig({
        ...getConfig(),
        ENABLE_COURSE_OUTLINE_NEW_DESIGN: 'true',
      });
      const newClickHandler = jest.fn();
      const useFromLibClickHandler = jest.fn();
      render(<OutlineAddChildButtons
        handleNewButtonClick={newClickHandler}
        handleUseFromLibraryClick={useFromLibClickHandler}
        childType={containerType}
        parentLocator=""
        parentTitle=""
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
  });
});

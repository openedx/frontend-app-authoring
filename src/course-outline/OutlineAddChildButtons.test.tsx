import userEvent from '@testing-library/user-event';
import { ContainerType } from '@src/generic/key-utils';
import { initializeMocks, render, screen, waitFor } from '@src/testUtils';
import {
  OutlineFlow,
  OutlineSidebarProvider,
} from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import OutlineAddChildButtons from './OutlineAddChildButtons';

jest.mock('@src/studio-home/data/selectors', () => ({
  ...jest.requireActual('@src/studio-home/data/selectors'),
  getStudioHomeData: () => ({
    librariesV2Enabled: true,
  }),
}));

const mockMutateAsync = jest.fn();
const mockMutate = jest.fn();
const mockCreateBlock = {
  mutateAsync: mockMutateAsync,
  mutate: mockMutate,
  isPending: false,
};

jest.mock('@src/course-outline/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-outline/data/apiHooks'),
  useCreateCourseBlock: jest.fn(() => mockCreateBlock),
}));

let mockIsMutatingCount = 0;
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useIsMutating: jest.fn(() => mockIsMutatingCount),
}));

const courseUsageKey = 'some/usage/key';
jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 'some-course-id',
    getUnitUrl: (id: string) => `/some/${id}`,
    openUnitPage: jest.fn(),
  }),
}));

jest.mock('@src/course-outline/CourseOutlineContext', () => ({
  ...jest.requireActual('@src/course-outline/CourseOutlineContext'),
  useCourseOutlineContext: () => ({
    courseUsageKey,
    currentSelection: undefined,
    selectContainer: jest.fn(),
    clearSelection: jest.fn(),
    openContainerInfo: jest.fn(),
    handleAddBlock: {
      isPending: false,
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
    },
    handleAddAndOpenUnit: {
      isPending: false,
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
    },
  }),
}));

const startCurrentFlow = jest.fn();
const openContainerInfoSidebar = jest.fn();
let currentFlow: OutlineFlow | null = null;
jest.mock('@src/course-outline/outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual(
    '@src/course-outline/outline-sidebar/OutlineSidebarContext',
  ),
  useOutlineSidebarContext: () => ({
    ...jest
      .requireActual(
        '@src/course-outline/outline-sidebar/OutlineSidebarContext',
      )
      .useOutlineSidebarContext(),
    startCurrentFlow,
    openContainerInfoSidebar,
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
      mockMutateAsync.mockReset();
      mockMutate.mockReset();
      mockIsMutatingCount = 0;
    });

    it('renders and behaves correctly', async () => {
      const newClickHandler = jest.fn();
      render(
        <OutlineAddChildButtons
          handleNewButtonClick={newClickHandler}
          childType={containerType}
          parentLocator=""
        />,
        { extraWrapper: OutlineSidebarProvider },
      );

      const newBtn = await screen.findByRole('button', {
        name: `New ${containerType}`,
      });
      expect(newBtn).toBeInTheDocument();
      const useBtn = await screen.findByRole('button', {
        name: `Use ${containerType} from library`,
      });
      expect(useBtn).toBeInTheDocument();
      await userEvent.click(newBtn);
      await waitFor(() => expect(newClickHandler).toHaveBeenCalled());
      await userEvent.click(useBtn);

      expect(startCurrentFlow).toHaveBeenCalledWith({
        flowType: containerType,
        parentLocator: '',
      });
    });

    it('calls appropriate new handlers', async () => {
      const parentLocator = `parent-of-${containerType}`;
      const grandParentLocator = `grandparent-of-${containerType}`;
      render(
        <OutlineAddChildButtons
          childType={containerType}
          parentLocator={parentLocator}
          grandParentLocator={grandParentLocator}
        />,
        { extraWrapper: OutlineSidebarProvider },
      );

      const newBtn = await screen.findByRole('button', {
        name: `New ${containerType}`,
      });
      expect(newBtn).toBeInTheDocument();

      // Set mocked return value before click so follow-up code
      // (openContainerInfoSidebar) runs after await mutateAsync.
      switch (containerType) {
        case ContainerType.Section:
          mockMutateAsync.mockResolvedValue({ locator: 'new-section-id' });
          break;
        case ContainerType.Subsection:
          mockMutateAsync.mockResolvedValue({ locator: 'new-subsection-id' });
          break;
        default:
          break;
      }
      await userEvent.click(newBtn);

      switch (containerType) {
        case ContainerType.Section:
          await waitFor(() =>
            expect(mockMutateAsync).toHaveBeenCalledWith({
              type: ContainerType.Chapter,
              parentLocator: courseUsageKey,
              displayName: 'Section',
            })
          );
          await waitFor(() => {
            expect(openContainerInfoSidebar).toHaveBeenCalledWith(
              'new-section-id',
              undefined,
              'new-section-id',
            );
          });
          break;
        case ContainerType.Subsection:
          await waitFor(() =>
            expect(mockMutateAsync).toHaveBeenCalledWith({
              type: ContainerType.Sequential,
              parentLocator,
              displayName: 'Subsection',
              sectionId: parentLocator,
            })
          );
          await waitFor(() => {
            expect(openContainerInfoSidebar).toHaveBeenCalledWith(
              'new-subsection-id',
              'new-subsection-id',
              parentLocator,
            );
          });
          break;
        case ContainerType.Unit:
          await waitFor(() =>
            expect(mockMutateAsync).toHaveBeenCalledWith({
              type: ContainerType.Vertical,
              parentLocator,
              displayName: 'Unit',
              sectionId: grandParentLocator,
            })
          );
          break;
        default:
          throw new Error(`Unknown container type: ${containerType}`);
      }
    });

    it('calls appropriate use handlers', async () => {
      const parentLocator = `parent-of-${containerType}`;
      render(
        <OutlineAddChildButtons
          childType={containerType}
          parentLocator={parentLocator}
        />,
        { extraWrapper: OutlineSidebarProvider },
      );
      const useBtn = await screen.findByRole('button', {
        name: `Use ${containerType} from library`,
      });
      expect(useBtn).toBeInTheDocument();
      await userEvent.click(useBtn);
      await waitFor(() =>
        expect(startCurrentFlow).toHaveBeenCalledWith({
          flowType: containerType,
          parentLocator,
        })
      );
    });

    it('shows appropriate static placeholder', async () => {
      const parentLocator = `parent-of-${containerType}`;
      currentFlow = {
        flowType: containerType,
        parentLocator,
      };
      render(
        <OutlineAddChildButtons
          childType={containerType}
          parentLocator={parentLocator}
        />,
        { extraWrapper: OutlineSidebarProvider },
      );
      // should show placeholder when use button is clicked
      expect(
        await screen.findByRole('heading', {
          name: new RegExp(`Adding Library ${containerType}`, 'i'),
        }),
      ).toBeInTheDocument();
    });

    it('shows spinner when createBlock mutation is pending', async () => {
      const parentLocator = `parent-of-${containerType}`;
      currentFlow = {
        flowType: containerType,
        parentLocator,
      };
      mockIsMutatingCount = 1;
      render(
        <OutlineAddChildButtons
          childType={containerType}
          parentLocator={parentLocator}
        />,
        { extraWrapper: OutlineSidebarProvider },
      );
      // should show placeholder with spinner when mutation is pending
      expect(
        await screen.findByRole('heading', {
          name: new RegExp(`Adding Library ${containerType}`, 'i'),
        }),
      ).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});

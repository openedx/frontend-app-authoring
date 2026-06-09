import { render, screen, initializeMocks } from '@src/testUtils';

import * as CourseAuthoringContext from '@src/CourseAuthoringContext';
import * as CourseOutlineContext from '@src/course-outline/CourseOutlineContext';
import * as CourseDetailsApi from '@src/data/apiHooks';
import * as ContentDataApi from '@src/content-tags-drawer/data/apiHooks';
import * as OutlineSidebarContext from './OutlineSidebarContext';
import { OutlineAlignSidebar } from './OutlineAlignSidebar';

jest.mock('@src/content-tags-drawer', () => ({
  ContentTagsDrawer: jest.fn(({ id, variant }) => (
    <div data-testid="content-tags-drawer">
      drawer-mock-{id}-{variant}
    </div>
  )),
}));

describe('OutlineAlignSidebar', () => {
  const setCurrentSelection = jest.fn();
  const clearSelection = jest.fn();
  const openContainerSidebar = jest.fn();
  const sectionId = 'block-v1:test+course+run+type@chapter+block@section-1';
  const subsectionId = 'block-v1:test+course+run+type@sequential+block@subsection-1';
  const unitId = 'block-v1:test+course+run+type@vertical+block@unit-1';

  beforeEach(() => {
    initializeMocks();
    setCurrentSelection.mockReset();
    clearSelection.mockReset();
    openContainerSidebar.mockReset();
    jest
      .spyOn(CourseAuthoringContext, 'useCourseAuthoringContext')
      .mockReturnValue({
        courseId: 'course-v1:test+course+run',
      } as any);
    jest
      .spyOn(CourseOutlineContext, 'useCourseOutlineContext')
      .mockReturnValue({
        setCurrentSelection,
        sections: [
          {
            id: sectionId,
            childInfo: {
              children: [
                { id: subsectionId, childInfo: { children: [{ id: unitId }] } },
              ],
            },
          },
        ],
      } as any);
    jest
      .spyOn(OutlineSidebarContext, 'useOutlineSidebarContext')
      .mockReturnValue({
        selectedContainerState: {
          currentId: 'block-v1:test+course+run+type@sequential+block@seq1',
        },
        clearSelection,
        openContainerSidebar,
      } as any);
    jest
      .spyOn(CourseDetailsApi, 'useCourseDetails')
      .mockReturnValue({
        data: { name: 'Test Course' },
      } as any);
    jest
      .spyOn(ContentDataApi, 'useContentData')
      .mockReturnValue({
        data: { displayName: 'Sequential 1' },
      } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders ContentTagsDrawer with the correct id and variant', () => {
    render(<OutlineAlignSidebar />);

    const drawer = screen.getByTestId('content-tags-drawer');

    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveTextContent(
      'drawer-mock-block-v1:test+course+run+type@sequential+block@seq1-component',
    );
  });

  it('renders ContentTagsDrawer with the course name', async () => {
    jest
      .spyOn(OutlineSidebarContext, 'useOutlineSidebarContext')
      .mockReturnValue({
        selectedContainerState: undefined,
        clearSelection,
        openContainerSidebar,
      } as any);
    jest
      .spyOn(CourseDetailsApi, 'useCourseDetails')
      .mockReturnValue({
        data: { courseDisplayNameWithDefault: 'Test Course' },
      } as any);
    jest
      .spyOn(ContentDataApi, 'useContentData')
      .mockReturnValue({
        data: { courseDisplayNameWithDefault: 'Test Course' },
      } as any);
    render(<OutlineAlignSidebar />);

    expect(await screen.findByText('Test Course')).toBeInTheDocument();
  });

  it('back button selects parent block in align sidebar', async () => {
    jest
      .spyOn(OutlineSidebarContext, 'useOutlineSidebarContext')
      .mockReturnValue({
        selectedContainerState: {
          currentId: unitId,
          subsectionId,
          sectionId,
        },
        clearSelection,
        openContainerSidebar,
      } as any);

    render(<OutlineAlignSidebar />);

    const backButton = await screen.findByRole('button', { name: /back/i });
    backButton.click();

    expect(openContainerSidebar).toHaveBeenCalledWith(subsectionId, subsectionId, sectionId, 0);
    expect(setCurrentSelection).toHaveBeenCalledWith({
      currentId: subsectionId,
      subsectionId,
      sectionId,
      index: 0,
    });
  });

  it('back button clears align selection when parent selection does not exist', async () => {
    jest
      .spyOn(OutlineSidebarContext, 'useOutlineSidebarContext')
      .mockReturnValue({
        selectedContainerState: {
          currentId: sectionId,
          sectionId,
        },
        clearSelection,
        openContainerSidebar,
      } as any);

    render(<OutlineAlignSidebar />);

    const backButton = await screen.findByRole('button', { name: /back/i });
    backButton.click();

    expect(clearSelection).toHaveBeenCalled();
    expect(setCurrentSelection).toHaveBeenCalledWith(undefined);
    expect(openContainerSidebar).not.toHaveBeenCalled();
  });
});

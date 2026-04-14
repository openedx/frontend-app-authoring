import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import { SectionSettings } from './SectionSettings';

const sectionId = 'section-1';

// Mock the HighlightsCard to expose a button that triggers onSubmit with sample data
jest.mock('@src/course-outline/highlights-modal/HighlightsModal', () => ({
  __esModule: true,
  HighlightsCard: ({ onSubmit }: any) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onSubmit({
            highlight_1: 'one',
            highlight_2: '',
            highlight_3: 'two',
            highlight_4: '',
            highlight_5: '',
          })}
      >
        Submit Highlights
      </button>
    </div>
  ),
}));

// Mock ReleaseSection and VisibilitySection to provide simple buttons that call onChange
jest.mock('./sharedSettings/ReleaseSection', () => ({
  __esModule: true,
  ReleaseSection: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange('2025-01-01')}>
      Release
    </button>
  ),
}));

jest.mock('./sharedSettings/VisibilitySection', () => ({
  __esModule: true,
  VisibilitySection: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange({ visibility: 'changed' })}>
      Visibility
    </button>
  ),
}));

// Mock hooks from apiHooks
const configureMutate = jest.fn();
const highlightsMutate = jest.fn();

jest.mock('@src/course-outline/data/apiHooks', () => ({
  useConfigureSection: () => ({ mutate: configureMutate }),
  useUpdateCourseSectionHighlights: () => ({ mutate: highlightsMutate }),
  useCourseItemData: jest.fn(),
  useCourseDetails: jest.fn(),
}));

// Mock CourseAuthoringContext
jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({ courseId: '5' }),
}));

const apiHooks = jest.requireMock('@src/course-outline/data/apiHooks') as any;

describe('SectionSettings', () => {
  beforeEach(() => {
    initializeMocks();
    configureMutate.mockReset();
    highlightsMutate.mockReset();
  });

  it('renders highlights, release and visibility and calls mutates with expected payloads', async () => {
    // course not self paced -> ReleaseSection should render
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({
      data: { visibilityState: 'staff_only', start: '2020-01-01' },
      isPending: false,
    });

    const user = userEvent.setup();
    render(<SectionSettings sectionId={sectionId} />);

    // Highlights submit should call highlightsMutate with filtered values
    await user.click(await screen.findByRole('button', { name: 'Submit Highlights' }));
    expect(highlightsMutate).toHaveBeenCalledWith({ sectionId, highlights: ['one', 'two'] });

    // Release button should be present and calling it should call configure mutate
    await user.click(await screen.findByRole('button', { name: 'Release' }));
    expect(configureMutate).toHaveBeenCalledWith(
      expect.objectContaining({ sectionId, isVisibleToStaffOnly: true, startDatetime: '2025-01-01' }),
    );

    // Visibility button should also call configure mutate
    await user.click(await screen.findByRole('button', { name: 'Visibility' }));
    expect(configureMutate).toHaveBeenCalledWith(
      expect.objectContaining({ sectionId, isVisibleToStaffOnly: true, visibility: 'changed' }),
    );
  });

  it('does not render ReleaseSection when course is self paced', () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: true } });
    apiHooks.useCourseItemData.mockReturnValue({ data: { visibilityState: 'gated', start: null }, isPending: false });

    render(<SectionSettings sectionId={sectionId} />);

    expect(screen.queryByRole('button', { name: 'Release' })).not.toBeInTheDocument();
    // Visibility should still be present
    expect(screen.getByRole('button', { name: 'Visibility' })).toBeInTheDocument();
  });

  it('does not call configure mutate when item data is pending', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({ data: { visibilityState: 'gated', start: null }, isPending: true });

    const user = userEvent.setup();
    render(<SectionSettings sectionId={sectionId} />);

    await user.click(screen.getByRole('button', { name: 'Visibility' }));
    expect(configureMutate).not.toHaveBeenCalled();
  });
});

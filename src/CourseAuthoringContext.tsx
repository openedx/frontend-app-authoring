import { getConfig } from '@edx/frontend-platform';
import { createContext, useContext, useMemo, useState } from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useCreateCourseBlock } from '@src/course-outline/data/apiHooks';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { getOutlineIndexData } from '@src/course-outline/data/selectors';
import { useToggleWithValue } from '@src/hooks';
import { SelectionState, type UnitXBlock, type XBlock } from '@src/data/types';
import { CourseDetailsData } from './data/api';
import { useCourseDetails, useWaffleFlags } from './data/apiHooks';
import { RequestStatusType } from './data/constants';

type ModalState = {
  value?: XBlock | UnitXBlock;
  subsectionId?: string;
  sectionId?: string;
};

export type CourseAuthoringContextData = {
  /** The ID of the current course */
  courseId: string;
  courseUsageKey: string;
  courseDetails?: CourseDetailsData;
  courseDetailStatus: RequestStatusType;
  canChangeProviders: boolean;
  handleAddAndOpenUnit: ReturnType<typeof useCreateCourseBlock>;
  handleAddBlock: ReturnType<typeof useCreateCourseBlock>;
  openUnitPage: (locator: string) => void;
  getUnitUrl: (locator: string) => string;
  isUnlinkModalOpen: boolean;
  currentUnlinkModalData?: ModalState;
  openUnlinkModal: (value: ModalState) => void;
  closeUnlinkModal: () => void;
  isPublishModalOpen: boolean;
  currentPublishModalData?: ModalState;
  openPublishModal: (value: ModalState) => void;
  closePublishModal: () => void;
  currentSelection?: SelectionState;
  setCurrentSelection: React.Dispatch<React.SetStateAction<SelectionState | undefined>>;
};

/**
 * Course Authoring Context.
 * Always available when we're in the context of a single course.
 *
 * Get this using `useCourseAuthoringContext()`
 *
 */
const CourseAuthoringContext = createContext<CourseAuthoringContextData | undefined>(undefined);

type CourseAuthoringProviderProps = {
  children?: React.ReactNode;
  courseId: string;
};

export const CourseAuthoringProvider = ({ children, courseId }: CourseAuthoringProviderProps) => {
  const navigate = useNavigate();
  const waffleFlags = useWaffleFlags();
  const { data: courseDetails, status: courseDetailStatus } = useCourseDetails(courseId);
  const canChangeProviders = getAuthenticatedUser().administrator || new Date(courseDetails?.start ?? 0) > new Date();
  const { courseStructure } = useSelector(getOutlineIndexData);
  const { id: courseUsageKey } = courseStructure || {};
  const [isUnlinkModalOpen, currentUnlinkModalData, openUnlinkModal, closeUnlinkModal] =
    useToggleWithValue<ModalState>();
  const [isPublishModalOpen, currentPublishModalData, openPublishModal, closePublishModal] =
    useToggleWithValue<ModalState>();
  /**
   * This will hold the state of current item that is being operated on,
   * For example:
   *  - the details of container that is being edited.
   *  - the details of container of which see more dropdown is open.
   * It is mostly used in modals which should be soon be replaced with its equivalent in sidebar.
   */
  const [currentSelection, setCurrentSelection] = useState<SelectionState | undefined>();

  const getUnitUrl = (locator: string) => {
    if (getConfig().ENABLE_UNIT_PAGE === 'true' && waffleFlags.useNewUnitPage) {
      // instanbul ignore next
      return `/course/${courseId}/container/${locator}`;
    }
    return `${getConfig().STUDIO_BASE_URL}/container/${locator}`;
  };

  /**
   * Open the unit page for a given locator.
   */
  const openUnitPage = async (locator: string) => {
    const url = getUnitUrl(locator);
    if (getConfig().ENABLE_UNIT_PAGE === 'true' && waffleFlags.useNewUnitPage) {
      // instanbul ignore next
      navigate(url);
    } else {
      window.location.assign(url);
    }
  };
  /**
   * import a unit block from library and redirect user to this unit page.
   */
  const handleAddAndOpenUnit = useCreateCourseBlock(courseId, openUnitPage);
  const handleAddBlock = useCreateCourseBlock(courseId);

  const context = useMemo<CourseAuthoringContextData>(
    () => ({
      courseId,
      courseUsageKey,
      courseDetails,
      courseDetailStatus,
      canChangeProviders,
      handleAddBlock,
      handleAddAndOpenUnit,
      getUnitUrl,
      openUnitPage,
      isUnlinkModalOpen,
      openUnlinkModal,
      closeUnlinkModal,
      currentUnlinkModalData,
      isPublishModalOpen,
      currentPublishModalData,
      openPublishModal,
      closePublishModal,
      currentSelection,
      setCurrentSelection,
    }),
    [
      courseId,
      courseUsageKey,
      courseDetails,
      courseDetailStatus,
      canChangeProviders,
      handleAddBlock,
      handleAddAndOpenUnit,
      getUnitUrl,
      openUnitPage,
      isUnlinkModalOpen,
      openUnlinkModal,
      closeUnlinkModal,
      currentUnlinkModalData,
      isPublishModalOpen,
      currentPublishModalData,
      openPublishModal,
      closePublishModal,
      currentSelection,
      setCurrentSelection,
    ],
  );

  return <CourseAuthoringContext.Provider value={context}>{children}</CourseAuthoringContext.Provider>;
};

export function useCourseAuthoringContext(): CourseAuthoringContextData {
  const ctx = useContext(CourseAuthoringContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error(
      'useCourseAuthoringContext() was used in a component without a <CourseAuthoringProvider> ancestor.',
    );
  }
  return ctx;
}

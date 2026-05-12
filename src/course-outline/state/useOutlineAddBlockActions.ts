import { useCreateCourseBlock } from '../data/apiHooks';

export type UseOutlineAddBlockActionsInput = {
  courseId: string;
  openUnitPage: (unitId: string) => Promise<void>;
};

export type UseOutlineAddBlockActions = {
  handleAddBlock: ReturnType<typeof useCreateCourseBlock>;
  handleAddAndOpenUnit: ReturnType<typeof useCreateCourseBlock>;
};

/**
 * Manages add-block mutation handlers for the course outline.
 *
 * Provides `handleAddBlock` for adding blocks without navigation and
 * `handleAddAndOpenUnit` for adding blocks and opening the unit page.
 */
const useOutlineAddBlockActions = ({
  courseId,
  openUnitPage,
}: UseOutlineAddBlockActionsInput): UseOutlineAddBlockActions => {
  const handleAddAndOpenUnit = useCreateCourseBlock(courseId, openUnitPage);
  const handleAddBlock = useCreateCourseBlock(courseId);

  return { handleAddBlock, handleAddAndOpenUnit };
};

export default useOutlineAddBlockActions;

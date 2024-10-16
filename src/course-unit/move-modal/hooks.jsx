import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { breakpoints } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../../data/constants';
import { getCourseOutlineInfo, getCourseOutlineInfoLoadingStatus } from '../data/selectors';
import { patchUnitItemQuery } from '../data/thunk';
import { CATEGORIES_KEYS, CATEGORIES_TEXT, CATEGORY_RELATION_MAP, MOVE_DIRECTIONS } from './constants';
import { findParentIds, getXBlockType } from './utils';
import messages from './messages';

const MOCKED_SOURCE_PARENT_XBLOCK_INFO = {
  "id": "block-v1:OpenedX+DemoX+DemoCourse+type@vertical+block@78b75020d3894fdfa8b4994f97275294",
  "display_name": "Welcome to the Open edX® platformWelcome to the Open edX® platformThe Purpose, Power and Reach of the Open edX® PlatformNavigating the Open edX® platformFeedbackCSS",
  "category": "vertical",
  "data": null,
  "metadata": null,
  "studio_url": null,
  "child_info": null,
  "ancestor_info": null,
  "edited_on": null,
  "edited_by": null,
  "published": null,
  "published_on": null,
  "published_by": null,
  "has_children": true,
  "has_changes": null,
  "visibility_state": null,
  "released_to_students": null,
  "release_date": null,
  "release_date_from": null,
  "currently_visible_to_students": null,
  "due_date": null,
  "format": null,
  "course_graders": null,
  "graded": null,
  "start": null,
  "due": null,
  "has_explicit_staff_lock": null,
  "ancestor_has_staff_lock": null,
  "staff_lock_from": null,
  "staff_only_message": null,
  "has_partition_group_components": null,
  "actions": null,
  "is_header_visible": null,
  "explanatory_message": null,
  "group_access": null,
  "user_partitions": null,
  "highlights": [],
  "highlights_enabled": false,
  "highlights_enabled_for_messaging": false,
  "highlights_preview_only": true,
  "highlights_doc_url": "",
  "summary_configuration_enabled": null,
  "tags": null,
  "hide_from_toc": null,
  "hide_from_toc_message": null,
  "courseKey": "course-v1:OpenedX+DemoX+DemoCourse"
};
const MOCKED_SOURCE_XBLOCK_INFO = {
  "id": "block-v1:OpenedX+DemoX+DemoCourse+type@annotatable+block@59daf2df3fac46f7b344cfb1321d337a",
  "display_name": "[MOVED] Annotation",
  "category": "html",
  "data": null,
  "metadata": null,
  "studio_url": null,
  "child_info": null,
  "ancestor_info": null,
  "edited_on": null,
  "edited_by": null,
  "published": null,
  "published_on": null,
  "published_by": null,
  "has_children": true,
  "has_changes": null,
  "visibility_state": null,
  "released_to_students": null,
  "release_date": null,
  "release_date_from": null,
  "currently_visible_to_students": null,
  "due_date": null,
  "format": null,
  "course_graders": null,
  "graded": null,
  "start": null,
  "due": null,
  "has_explicit_staff_lock": null,
  "ancestor_has_staff_lock": null,
  "staff_lock_from": null,
  "staff_only_message": null,
  "has_partition_group_components": null,
  "actions": null,
  "is_header_visible": null,
  "explanatory_message": null,
  "group_access": null,
  "user_partitions": null,
  "highlights": [],
  "highlights_enabled": false,
  "highlights_enabled_for_messaging": false,
  "highlights_preview_only": true,
  "highlights_doc_url": "",
  "summary_configuration_enabled": null,
  "tags": null,
  "hide_from_toc": null,
  "hide_from_toc_message": null,
  "courseKey": "course-v1:OpenedX+DemoX+DemoCourse"
};

// eslint-disable-next-line import/prefer-default-export
export const useMoveModal = ({ isOpen, closeModal }) => {
  const { blockId } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const courseOutlineInfo = useSelector(getCourseOutlineInfo);
  const loadingStatus = useSelector(getCourseOutlineInfoLoadingStatus);
  const initialValues = {
    childrenInfo: {
      children: courseOutlineInfo.child_info?.children ?? [],
      category: CATEGORIES_KEYS.section,
    },
    parentInfo: {
      parent: courseOutlineInfo,
      category: CATEGORIES_KEYS.course,
    },
    isValidMove: false,
  };

  const [childrenInfo, setChildrenInfo] = useState(initialValues.childrenInfo);
  const [parentInfo, setParentInfo] = useState(initialValues.parentInfo);
  const [visitedAncestors, setVisitedAncestors] = useState([initialValues.parentInfo.parent]);
  const [isValidMove, setIsValidMove] = useState(initialValues.isValidMove);

  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });
  const currentXBlockParentIds = findParentIds(courseOutlineInfo, MOCKED_SOURCE_XBLOCK_INFO.id);

  /**
   * Update XBlocks parent data based on `forward` or `backward` navigation.
   *
   * @param {any} direction - `forward` or `backward`
   * @param {any} newParentIndex - Index of a parent XBlock
   */
  const updateParentItemsData = (direction, newParentIndex) => {
    if (direction === undefined) {
      setParentInfo(initialValues.parentInfo);
      setVisitedAncestors([ initialValues.parentInfo.parent ]);
    } else if (direction === MOVE_DIRECTIONS.forward) {
      setParentInfo({ parent: childrenInfo.children[newParentIndex] });
      setVisitedAncestors((prevState) => ([...prevState, childrenInfo.children[newParentIndex] ]));
    } else if (direction === MOVE_DIRECTIONS.backward) {
      setParentInfo({ parent: visitedAncestors[newParentIndex] });
      setVisitedAncestors((prevState) => prevState.slice(0, parseInt(newParentIndex) + 1));
    }
  };

  /**
   * Forward button press handler. This will render all the children of an XBlock.
   *
   * @param {number} newParentIndex - Index of a parent XBlock
   */
  const handleXBlockClick = (newParentIndex) => {
    updateParentItemsData(MOVE_DIRECTIONS.forward, newParentIndex);
  };

  /**
   * Breadcrumb button press event handler. Render all the childs of an XBlock.
   *
   * @param {any} newParentIndex - Index of a parent XBlock
   */
  const handleBreadcrumbsClick = (newParentIndex) => {
    updateParentItemsData(MOVE_DIRECTIONS.backward, newParentIndex);
  };

  /**
   * Update XBlocks children data based on parent data.
   */
  const updateChildrenItemsData = () => {
    setChildrenInfo((prevState) => ({
      ...prevState,
      children: parentInfo.parent?.child_info ? parentInfo.parent.child_info.children : [],
    }));
  };

  /**
   * Get category text for currently displayed children.
   *
   * @returns {String} - Category text.
   */
  const getCategoryText = () => {
    return intl.formatMessage(CATEGORIES_TEXT[childrenInfo.category]) || '';
  };

  /**
   * Construct breadcrumbs info.
   *
   * @returns {Object} - Breadcrumbs data.
   */
  const getBreadcrumbs = () => {
    return visitedAncestors.map((ancestor) => (
      ancestor?.category === CATEGORIES_KEYS.course
        ? intl.formatMessage(messages.moveModalBreadcrumbsBaseCategory)
        : ancestor?.display_name
    ));
  }

  /**
   * Set parent and child XBlock categories.
   */
  const setDisplayedXBlocksCategories = () => {
    let childCategory = CATEGORIES_KEYS.component;

    const newParentCategory = getXBlockType(parentInfo.parent?.category, parentInfo.category);
    if (parentInfo.category !== newParentCategory) {
      setParentInfo((prevState) => ({ ...prevState, category: newParentCategory }));
    }

    if (!Object.keys(CATEGORY_RELATION_MAP).includes(parentInfo.category)) {
      if (parentInfo.category === CATEGORIES_KEYS.split_test) {
        childCategory = CATEGORIES_KEYS.group;
      }
    }

    const newChildCategory = CATEGORY_RELATION_MAP[newParentCategory] || childCategory;
    if (childrenInfo.category !== newChildCategory) {
      setChildrenInfo((prevState) => ({ ...prevState, category: newChildCategory }));
    }
  };

  /**
   * Handles closing of the modal and resets relevant state to their initial values.
   */
  const handleCLoseModal = () => {
    setChildrenInfo(initialValues.childrenInfo);
    setParentInfo(initialValues.parentInfo);
    setVisitedAncestors([initialValues.parentInfo.parent]);
    closeModal();
  }

  /**
   * Determines if the target parent category is valid based on the source parent category.
   * It adjusts the source and target categories when necessary to allow certain moves under specific xBlock types.
   *
   * @param {Object} targetParentXBlockInfo - The xBlock info for the target parent.
   * @param {string} targetParentXBlockInfo.category - The category of the target parent xBlock.
   * @param {boolean} targetParentXBlockInfo.has_children - Indicates if the target parent xBlock has children.
   * @returns {boolean} - Returns true if the target parent category is valid for the move, otherwise false.
   */
  const isValidCategory = (targetParentXBlockInfo) => {
    const basicBlockTypes = [
      CATEGORIES_KEYS.course,
      CATEGORIES_KEYS.chapter,
      CATEGORIES_KEYS.sequential,
      CATEGORIES_KEYS.vertical,
    ];
    let {
      category: sourceParentCategory,
      has_children: sourceParentHasChildren,
    } = MOCKED_SOURCE_PARENT_XBLOCK_INFO;
    let {
      category: targetParentCategory,
      has_children: targetParentHasChildren,
    } = targetParentXBlockInfo;

    // Treat source parent component as vertical to support move child components under content experiment
    // and other similar xBlocks.
    if (sourceParentHasChildren && !basicBlockTypes.includes(sourceParentCategory)) {
      sourceParentCategory = CATEGORIES_KEYS.vertical;
    }

    // Treat target parent component as a vertical to support move to parentable target parent components.
    // Also, moving a component directly to content experiment is not allowed, we need to visit to group level.
    if (
      targetParentHasChildren
      && !basicBlockTypes.includes(targetParentCategory)
      && targetParentCategory !== CATEGORIES_KEYS.split_test
    ) {
      targetParentCategory = CATEGORIES_KEYS.vertical;
    }

    return targetParentCategory === sourceParentCategory;
  };

  /**
   * Enables the move operation by validating the category and ensuring the move is not to the same parent or source.
   * Updates the isValidMove state when necessary.
   *
   * @param {Object} targetParentXBlockInfo - The xBlock info for the target parent.
   * @param {string} targetParentXBlockInfo.id - The ID of the target parent xBlock.
   * @param {string} targetParentXBlockInfo.category - The category of the target parent xBlock.
   * @param {boolean} targetParentXBlockInfo.has_children - Indicates if the target parent xBlock has children.
   * @returns {void}
   */
  const enableMoveOperation = (targetParentXBlockInfo) => {
      let isValid = false;

      // update target parent on navigation
      if (
        isValidCategory(targetParentXBlockInfo)
        && MOCKED_SOURCE_PARENT_XBLOCK_INFO.id !== targetParentXBlockInfo.id // same parent case
        && MOCKED_SOURCE_XBLOCK_INFO.id !== targetParentXBlockInfo.id // same source item case
      ) {
          isValid = true;
      }

      if (isValidMove !== isValid) {
        setIsValidMove(isValid);
      }
  };

  /**
   * Handles submitting event message to trigger move modal.
   */
  const handleMoveXBlock = () => {
    const targetParentLocator = 'block-v1:OpenedX+DemoX+DemoCourse+type@vertical+block@2a1f276a2b964eb6b137ed56abfe9052'
    // const targetParentLocator = 'block-v1:OpenedX+DemoX+DemoCourse+type@vertical+block@78b75020d3894fdfa8b4994f97275294';

    // SHOULD BE REPLACED WITH `blockId`
    // const currentParentLocator = 'block-v1:OpenedX+DemoX+DemoCourse+type@vertical+block@2a1f276a2b964eb6b137ed56abfe9052'
    const currentParentLocator = 'block-v1:OpenedX+DemoX+DemoCourse+type@vertical+block@78b75020d3894fdfa8b4994f97275294';

    const { id: sourceLocator, display_name: title } = MOCKED_SOURCE_XBLOCK_INFO;
    dispatch(patchUnitItemQuery({
      sourceLocator,
      targetParentLocator,
      title,
      currentParentLocator,
      isMoving: true,
      callbackFn: closeModal,
    }));
  };

  useEffect(() => {
    if (loadingStatus === RequestStatus.SUCCESSFUL) {
      updateParentItemsData();
    }
  }, [loadingStatus]);

  useEffect(() => {
    if (loadingStatus === RequestStatus.SUCCESSFUL) {
      updateChildrenItemsData();
      setDisplayedXBlocksCategories();
      enableMoveOperation(parentInfo.parent);
    }
  }, [parentInfo]);

  return {
    isLoading: loadingStatus === RequestStatus.IN_PROGRESS,
    isValidMove,
    isExtraSmall,
    parentInfo,
    childrenInfo,
    displayName: MOCKED_SOURCE_XBLOCK_INFO.display_name,
    sourceXBlockId: MOCKED_SOURCE_XBLOCK_INFO.id,
    categoryText: getCategoryText(),
    breadcrumbs: getBreadcrumbs(),
    currentXBlockParentIds,
    handleXBlockClick,
    handleBreadcrumbsClick,
    handleCLoseModal,
    handleMoveXBlock,
  }
};

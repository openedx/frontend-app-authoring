import {
  useCallback, useEffect, useState, useMemo,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { breakpoints } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../../data/constants';
import { useEventListener } from '../../generic/hooks';
import { getCourseOutlineInfo, getCourseOutlineInfoLoadingStatus } from '../data/selectors';
import { getCourseOutlineInfoQuery, patchUnitItemQuery } from '../data/thunk';
import { useIframe } from '../context/hooks';
import { messageTypes } from '../constants';
import { CATEGORIES, MOVE_DIRECTIONS } from './constants';
import {
  findParentIds, getBreadcrumbs, getXBlockType, isValidCategory,
} from './utils';
import {
  IState, IUseMoveModalParams, IUseMoveModalReturn, IXBlockInfo,
} from './interfaces';

// eslint-disable-next-line import/prefer-default-export
export const useMoveModal = ({
  isOpenModal, closeModal, openModal, courseId,
}: IUseMoveModalParams): IUseMoveModalReturn => {
  const { blockId } = useParams<{ blockId: string }>();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { sendMessageToIframe } = useIframe();
  const courseOutlineInfo = useSelector(getCourseOutlineInfo);
  const courseOutlineInfoLoadingStatus = useSelector(getCourseOutlineInfoLoadingStatus);

  const initialValues = useMemo<IState>(() => ({
    childrenInfo: { children: courseOutlineInfo.childInfo?.children ?? [], category: CATEGORIES.KEYS.section },
    parentInfo: { parent: courseOutlineInfo, category: CATEGORIES.KEYS.course },
    isValidMove: false,
    sourceXBlockInfo: { current: {} as IXBlockInfo, parent: {} as IXBlockInfo },
    visitedAncestors: [courseOutlineInfo],
  }), [courseOutlineInfo]);

  const [state, setState] = useState<IState>(initialValues);

  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth });

  const currentXBlockParentIds = useMemo(
    () => findParentIds(courseOutlineInfo, state.sourceXBlockInfo.current.id as string),
    [courseOutlineInfo, state.sourceXBlockInfo.current.id],
  );

  const receiveMessage = useCallback(({ data }: { data: any }) => {
    const { payload, type } = data;

    if (type === messageTypes.showMoveXBlockModal) {
      setState((prevState) => ({
        ...prevState,
        sourceXBlockInfo: {
          current: payload.sourceXBlockInfo,
          parent: payload.sourceParentXBlockInfo,
        },
      }));
      openModal();
    }
  }, [openModal]);

  useEventListener('message', receiveMessage);

  const updateParentItemsData = useCallback((direction?: string, newParentIndex?: string) => {
    setState((prevState: IState) => {
      if (!direction) {
        return {
          ...prevState,
          parentInfo: {
            parent: initialValues.parentInfo.parent,
            category: initialValues.parentInfo.category,
          },
          visitedAncestors: [initialValues.parentInfo.parent],
        };
      }

      if (
        direction === MOVE_DIRECTIONS.forward && newParentIndex !== undefined
        && prevState.childrenInfo.children[newParentIndex]
      ) {
        const newParent = prevState.childrenInfo.children[newParentIndex];
        return {
          ...prevState,
          parentInfo: {
            parent: newParent,
            category: prevState.parentInfo.category,
          },
          visitedAncestors: [...prevState.visitedAncestors, newParent],
        };
      }

      if (
        direction === MOVE_DIRECTIONS.backward && newParentIndex !== undefined
        && prevState.visitedAncestors[newParentIndex]
      ) {
        return {
          ...prevState,
          parentInfo: {
            parent: prevState.visitedAncestors[newParentIndex],
            category: prevState.parentInfo.category,
          },
          visitedAncestors: prevState.visitedAncestors.slice(0, parseInt(newParentIndex, 10) + 1),
        };
      }

      return prevState;
    });
  }, [initialValues]);

  const handleXBlockClick = useCallback((newParentIndex: string) => {
    updateParentItemsData(MOVE_DIRECTIONS.forward, newParentIndex);
  }, [updateParentItemsData]);

  const handleBreadcrumbsClick = useCallback((newParentIndex: string) => {
    updateParentItemsData(MOVE_DIRECTIONS.backward, newParentIndex);
  }, [updateParentItemsData]);

  const updateChildrenItemsData = useCallback(() => {
    setState((prevState: IState) => ({
      ...prevState,
      childrenInfo: {
        ...prevState.childrenInfo,
        children: prevState.parentInfo.parent?.childInfo?.children || [],
      },
    }));
  }, []);

  const getCategoryText = useCallback(() => (
    intl.formatMessage(CATEGORIES.TEXT[state.childrenInfo.category]) || ''
  ), [intl, state.childrenInfo.category]);

  const breadcrumbs = useMemo(() => (
    getBreadcrumbs(state.visitedAncestors, intl.formatMessage)
  ), [state.visitedAncestors]);

  const setDisplayedXBlocksCategories = useCallback(() => {
    setState((prevState) => {
      const childCategory = CATEGORIES.KEYS.component;
      const newParentCategory = getXBlockType(prevState.parentInfo.parent?.category || '');

      if (prevState.parentInfo.category !== newParentCategory) {
        return {
          ...prevState,
          parentInfo: {
            ...prevState.parentInfo,
            category: newParentCategory,
          },
          childrenInfo: {
            ...prevState.childrenInfo,
            category: CATEGORIES.RELATION_MAP[newParentCategory] || childCategory,
          },
        };
      }
      return prevState;
    });
  }, []);

  const handleCLoseModal = useCallback(() => {
    setState(initialValues);
    closeModal();
  }, [initialValues, closeModal]);

  const enableMoveOperation = useCallback((targetParentXBlockInfo: IXBlockInfo) => {
    const isValid = isValidCategory(state.sourceXBlockInfo.parent, targetParentXBlockInfo)
      && state.sourceXBlockInfo.parent.id !== targetParentXBlockInfo.id // different parent
      && state.sourceXBlockInfo.current.id !== targetParentXBlockInfo.id; // different source item

    setState((prevState) => ({
      ...prevState,
      isValidMove: isValid,
    }));
  }, [isValidCategory, state.sourceXBlockInfo]);

  const handleMoveXBlock = useCallback(() => {
    const lastAncestor = state.visitedAncestors[state.visitedAncestors.length - 1];
    dispatch(patchUnitItemQuery({
      sourceLocator: state.sourceXBlockInfo.current.id,
      targetParentLocator: lastAncestor.id,
      title: state.sourceXBlockInfo.current.displayName,
      currentParentLocator: blockId,
      isMoving: true,
      callbackFn: () => {
        sendMessageToIframe(messageTypes.refreshXBlock, null);
        closeModal();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    }));
  }, [state, dispatch, blockId, closeModal]);

  useEffect(() => {
    if (isOpenModal && !Object.keys(courseOutlineInfo).length) {
      dispatch(getCourseOutlineInfoQuery(courseId));
    }
  }, [isOpenModal, courseOutlineInfo, courseId, dispatch]);

  useEffect(() => {
    if (isOpenModal && courseOutlineInfoLoadingStatus === RequestStatus.SUCCESSFUL) {
      updateParentItemsData();
    }
  }, [courseOutlineInfoLoadingStatus, isOpenModal, updateParentItemsData]);

  useEffect(() => {
    if (isOpenModal && courseOutlineInfoLoadingStatus === RequestStatus.SUCCESSFUL) {
      updateChildrenItemsData();
      setDisplayedXBlocksCategories();
      enableMoveOperation(state.parentInfo.parent);
    }
  }, [
    state.parentInfo, isOpenModal, courseOutlineInfoLoadingStatus, updateChildrenItemsData,
    setDisplayedXBlocksCategories, enableMoveOperation,
  ]);

  return {
    isLoading: courseOutlineInfoLoadingStatus === RequestStatus.IN_PROGRESS,
    isValidMove: state.isValidMove,
    isExtraSmall,
    parentInfo: state.parentInfo,
    childrenInfo: state.childrenInfo,
    displayName: state.sourceXBlockInfo.current.displayName,
    sourceXBlockId: state.sourceXBlockInfo.current.id,
    categoryText: getCategoryText(),
    breadcrumbs,
    currentXBlockParentIds,
    handleXBlockClick,
    handleBreadcrumbsClick,
    handleCLoseModal,
    handleMoveXBlock,
  };
};

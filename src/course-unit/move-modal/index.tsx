import React, { FC, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Breadcrumb,
  Button,
  ModalDialog,
} from '@openedx/paragon';
import {
  ArrowForwardIos as ArrowForwardIosIcon,
} from '@openedx/paragon/icons';

import { LoadingSpinner } from '../../generic/Loading';
import { CATEGORIES_KEYS } from './constants';
import { IUseMoveModalParams, IXBlock, IXBlockInfo } from './interfaces';
import { useMoveModal } from './hooks';
import messages from './messages';

const MoveModal: FC<IUseMoveModalParams> = ({
  isOpenModal, closeModal, openModal, courseId,
}) => {
  const intl = useIntl();

  const {
    isLoading,
    isValidMove,
    isExtraSmall,
    parentInfo,
    childrenInfo,
    displayName,
    categoryText,
    breadcrumbs,
    sourceXBlockId,
    currentXBlockParentIds,
    handleXBlockClick,
    handleBreadcrumbsClick,
    handleCLoseModal,
    handleMoveXBlock,
  } = useMoveModal({
    isOpenModal, closeModal, openModal, courseId,
  });

  const getLoader = useCallback(() => (
    <div className="move-xblock-modal-loading">
      <LoadingSpinner />
    </div>
  ), []);

  const getBreadcrumbs = useCallback(() => (
    <Breadcrumb
      ariaLabel={intl.formatMessage(messages.moveModalBreadcrumbsLabel)}
      data-testid="move-xblock-modal-breadcrumbs"
      isMobile={isExtraSmall}
      links={breadcrumbs.slice(0, -1).map((breadcrumb, index) => (
        { label: breadcrumb, 'data-parent-index': index }
      ))}
      activeLabel={breadcrumbs[breadcrumbs.length - 1]}
      clickHandler={({ target }) => handleBreadcrumbsClick(target.dataset.parentIndex)}
    />
  ), [isExtraSmall, breadcrumbs, handleBreadcrumbsClick]);

  const getEmptyMessage = useCallback(() => (
      <li className="xblock-no-child-message">
        {intl.formatMessage(messages.moveModalEmptyCategoryText, {
          category: parentInfo.category,
          categoryText: categoryText.toLowerCase(),
        })}
      </li>
  ), [parentInfo.category, categoryText]);

  const getCategoryIndicator = useCallback(() => (
      <div className="xblock-items-category small text-gray-500">
      <span className="sr-only">
        {intl.formatMessage(messages.moveModalCategoryIndicatorAccessibilityText, { categoryText, displayName })}
      </span>
      <span
        className="category-text"
        aria-hidden="true"
        data-testId="move-xblock-modal-category"
      >
        {categoryText}
      </span>
    </div>
  ), [categoryText, displayName]);

  const getCourseStructureItemButton = useCallback((xBlock: IXBlock, index: number) => (
    <Button
      variant="link"
      className="button-forward text-left justify-content-start text-gray-700"
      type="button"
      onClick={() => handleXBlockClick(index)}
    >
      <span className="xblock-displayname text-truncate">
        {xBlock?.display_name}
      </span>
      {currentXBlockParentIds.includes(xBlock.id) && (
        <span className="current-location text-nowrap mr-3">
          {intl.formatMessage(messages.moveModalOutlineItemCurrentLocationText)}
        </span>
      )}
      <ArrowForwardIosIcon className="ml-auto flex-shrink-0" />
      <span className="sr-only">
        {intl.formatMessage(messages.moveModalOutlineItemViewText)}
      </span>
    </Button>
  ), [currentXBlockParentIds, handleXBlockClick]);

  const getCourseStructureItemSpan = useCallback((xBlock: IXBlock) => (
    <span className="component text-left justify-content-start text-gray-700">
      <span className="xblock-displayname text-truncate">
        {xBlock?.display_name}
      </span>
      {currentXBlockParentIds.includes(xBlock.id) && (
        <span className="current-location text-nowrap mr-3">
          {intl.formatMessage(messages.moveModalOutlineItemCurrentComponentLocationText)}
        </span>
      )}
    </span>
  ), [currentXBlockParentIds]);

  const getCourseStructureListItem = useCallback((xBlock: IXBlock, index: number) => (
    <li key={xBlock.id} className="xblock-item">
      {sourceXBlockId !== xBlock.id && (xBlock?.child_info || childrenInfo.category !== CATEGORIES_KEYS.component)
        ? getCourseStructureItemButton(xBlock, index)
        : getCourseStructureItemSpan(xBlock)}
    </li>
  ), [sourceXBlockId, childrenInfo.category, getCourseStructureItemButton, getCourseStructureItemSpan]);

  return (
    <ModalDialog
      isOpen={isOpenModal}
      onClose={handleCLoseModal}
      size="xl"
      className="move-xblock-modal"
      hasCloseButton
      isFullscreenOnMobile
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.moveModalTitle, { displayName })}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {isLoading ? getLoader() : (
          <>
            {getBreadcrumbs()}
            <div className="xblock-list-container">
              {getCategoryIndicator()}
              <ul className="xblock-items-container p-0 m-0">
                {!childrenInfo.children?.length
                  ? getEmptyMessage()
                  : childrenInfo.children.map((xBlock: IXBlock | IXBlockInfo, index: number) => {
                    return getCourseStructureListItem(xBlock as IXBlock, index);
                  })}
              </ul>
            </div>
          </>
        )}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.moveModalCancelButton)}
          </ModalDialog.CloseButton>
          <Button
            disabled={!isValidMove}
            onClick={handleMoveXBlock}
          >
            {intl.formatMessage(messages.moveModalSubmitButton)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

MoveModal.propTypes = {
  isOpenModal: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default MoveModal;

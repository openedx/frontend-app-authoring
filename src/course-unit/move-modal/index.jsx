// TODO: List
// - Create tests for the move modal
// - Fix optimization (too many re-renders)
// - After move operation is completed, the event (post message) is send to children iframe to refresh the unit content.
// - If user clicks undo the Move request to revert action is send, and refresh content message is sent to children iframe.

import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useIntl, injectIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Breadcrumb,
  Button,
  ModalDialog,
} from '@openedx/paragon';
import {
  ArrowForwardIos as ArrowForwardIosIcon,
} from '@openedx/paragon/icons';

import Loading from '../../generic/Loading';
import { useMoveModal } from './hooks';
import { CATEGORIES_KEYS } from './constants';
import messages from './messages';

const MoveModal = ({ isOpen, close }) => {
  if (!isOpen) return null;

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
  } = useMoveModal({ isOpen, closeModal: close });

  const getBreadcrumbs = useCallback(() => (
    <Breadcrumb
      ariaLabel="Course Outline breadcrumb"
      isMobile={isExtraSmall}
      links={breadcrumbs.slice(0, -1).map((breadcrumb, index) => (
        { label: breadcrumb, 'data-parent-index': index }
      ))}
      activeLabel={breadcrumbs[breadcrumbs.length - 1]}
      clickHandler={(e) => handleBreadcrumbsClick(e.target.dataset.parentIndex)}
    />
  ), [isExtraSmall, breadcrumbs, handleBreadcrumbsClick]);

  const getEmptyMessage = useCallback(() => (
    <span className="xblock-no-child-message">
      This {parentInfo.category} has no {categoryText.toLowerCase()}
    </span>
  ), [parentInfo.category, categoryText]);

  const getCategoryIndicator = useCallback(() => (
    <div className="xblock-items-category small text-gray-500">
      <span className="sr-only">{categoryText} in {displayName}</span>
      <span className="category-text" aria-hidden="true">{categoryText}</span>
    </div>
  ), [categoryText, displayName]);

  const getCourseStructureItemButton = useCallback((xblock, index) => (
    <Button
      variant="link"
      className="button-forward text-left justify-content-start text-gray-700"
      type="button"
      onClick={() => handleXBlockClick(index)}
    >
      <span className="xblock-displayname text-truncate">
        {xblock?.display_name}
      </span>
      {currentXBlockParentIds.includes(xblock.id) && (
        <span className="current-location text-nowrap mr-3">
          (Current location)
        </span>
      )}
      <ArrowForwardIosIcon className="ml-auto flex-shrink-0" />
      <span className="sr-only">View child items</span>
    </Button>
  ), [currentXBlockParentIds, handleXBlockClick]);

  const getCourseStructureItemSpan = useCallback((xblock) => (
    <span className="component text-left justify-content-start text-gray-700">
      <span className="xblock-displayname text-truncate">
        {xblock?.display_name}
      </span>
      {currentXBlockParentIds.includes(xblock.id) && (
        <span className="current-location text-nowrap mr-3">
          (Currently selected)
        </span>
      )}
    </span>
  ), [currentXBlockParentIds]);

  const getCourseStructureListItem = useCallback((xblock, index) => (
    <li key={xblock.id} className="xblock-item">
      {sourceXBlockId !== xblock.id && (xblock?.child_info || childrenInfo.category !== CATEGORIES_KEYS.component)
        ? getCourseStructureItemButton(xblock, index)
        : getCourseStructureItemSpan(xblock)}
    </li>
  ), [sourceXBlockId, childrenInfo.category, getCourseStructureItemButton, getCourseStructureItemSpan]);

  return (
    <ModalDialog
      isOpen={isOpen}
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
        {isLoading ? <Loading /> : (
          <>
            {getBreadcrumbs()}
            <div className="xblock-list-container">
              {getCategoryIndicator()}
              <ul className="xblock-items-container p-0 m-0">
                {!childrenInfo.children?.length
                  ? getEmptyMessage() :
                  childrenInfo.children.map((xblock, index) => getCourseStructureListItem(xblock, index))}
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
  )
};

MoveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired
};

export default injectIntl(MoveModal);

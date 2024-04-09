import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import {
  ActionRow, Card, Dropdown, Icon, IconButton, useToggle,
} from '@openedx/paragon';
import { EditOutline as EditIcon, MoreVert as MoveVertIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getCanEdit, getCourseId } from '../data/selectors';
import { useOverflowControl } from '../../generic/hooks';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import ConfigureModal from '../../generic/configure-modal/ConfigureModal';
import SortableItem from '../../generic/drag-helper/SortableItem';
import { scrollToElement } from '../../course-outline/utils';
import { COURSE_BLOCK_NAMES } from '../../constants';
import { copyToClipboard } from '../../generic/data/thunks';
import { fetchCourseUnitQuery, fetchCourseVerticalChildrenData } from '../data/thunk';
import { updateMovedXBlockParams } from '../data/slice';
import { COMPONENT_TYPES } from '../constants';
import XBlockMessages from './xblock-messages/XBlockMessages';
import messages from './messages';
import { getXBlockActionsBasePath } from './utils';
import CourseIFrame from './CourseIFrame';

const XBLOCK_LEGACY_MODAL_CLASS_NAME = 'xblock-edit-modal';

const CourseXBlock = ({
  id, title, type, unitXBlockActions, shouldScroll, userPartitionInfo,
  handleConfigureSubmit, validationMessages, renderError, blockId, ...props
}) => {
  const courseXBlockElementRef = useRef(null);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const canEdit = useSelector(getCanEdit);
  const courseId = useSelector(getCourseId);
  const intl = useIntl();
  const [showLegacyEditModal, toggleLegacyEditModal] = useState(false);
  const [showLegacyMoveModal, toggleLegacyMoveModal] = useState(false);
  const xblockLegacyModalRef = useRef(null);

  useOverflowControl(`.${XBLOCK_LEGACY_MODAL_CLASS_NAME}`);

  useEffect(() => {
    const handleMessage = (event) => {
      const { method, params } = event.data;

      if (method === 'close_modal') {
        toggleLegacyEditModal(false);
        dispatch(fetchCourseVerticalChildrenData(blockId));
        dispatch(fetchCourseUnitQuery(blockId));
      } else if (method === 'move_xblock') {
        toggleLegacyMoveModal(false);
        dispatch(updateMovedXBlockParams({
          title: params.sourceDisplayName,
          isSuccess: true,
          sourceLocator: params.sourceLocator,
          targetParentLocator: params.targetParentLocator,
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [xblockLegacyModalRef]);

  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const isScrolledToElement = locatorId === id;

  const visibilityMessage = userPartitionInfo.selectedGroupsLabel
    ? intl.formatMessage(messages.visibilityMessage, { selectedGroupsLabel: userPartitionInfo.selectedGroupsLabel })
    : null;

  useEffect(() => {
    localStorage.removeItem('editedXBlockId');
  }, []);

  const currentItemData = {
    category: COURSE_BLOCK_NAMES.component.id,
    displayName: title,
    userPartitionInfo,
    showCorrectness: 'always',
  };

  const onDeleteSubmit = () => {
    unitXBlockActions.handleDelete(id);
    closeDeleteModal();
  };

  const handleEdit = () => {
    switch (type) {
    case COMPONENT_TYPES.html:
    case COMPONENT_TYPES.problem:
    case COMPONENT_TYPES.video:
      navigate(`/course/${courseId}/editor/${type}/${id}`);
      break;
    default:
      toggleLegacyEditModal(true);
      localStorage.setItem('editedXBlockId', id);
    }
  };

  const handleXBlockMove = () => {
    toggleLegacyMoveModal(true);
    dispatch(updateMovedXBlockParams({
      isSuccess: false,
      isUndo: false,
      title: '',
      sourceLocator: '',
      targetParentLocator: '',
    }));
  };

  const onConfigureSubmit = (...arg) => {
    handleConfigureSubmit(id, ...arg, closeConfigureModal);
  };

  useEffect(() => {
    // if this item has been newly added, scroll to it.
    if (courseXBlockElementRef.current && (shouldScroll || isScrolledToElement)) {
      scrollToElement(courseXBlockElementRef.current);
    }
  }, [isScrolledToElement]);

  return (
    <>
      {showLegacyEditModal && (
        <div className={XBLOCK_LEGACY_MODAL_CLASS_NAME}>
          <CourseIFrame
            title="xblock-edit-modal-iframe"
            key="xblock-edit-modal-key"
            ref={xblockLegacyModalRef}
            src={`${getXBlockActionsBasePath(id)}/edit`}
          />
        </div>
      )}
      {showLegacyMoveModal && (
        <div className={XBLOCK_LEGACY_MODAL_CLASS_NAME}>
          <CourseIFrame
            title="xblock-move-modal-iframe"
            key="xblock-move-modal-key"
            ref={xblockLegacyModalRef}
            src={`${getXBlockActionsBasePath(id)}/move`}
          />
        </div>
      )}
      <div
        id={id}
        ref={courseXBlockElementRef}
        {...props}
        className={classNames('course-unit__xblock', {
          'xblock-highlight': isScrolledToElement,
        })}
      >
        <Card
          as={SortableItem}
          id={id}
          draggable
          category="xblock"
          componentStyle={{ marginBottom: 0 }}
        >
          <Card.Header
            title={title}
            subtitle={visibilityMessage}
            actions={(
              <ActionRow className="mr-2">
                <IconButton
                  alt={intl.formatMessage(messages.blockAltButtonEdit)}
                  iconAs={EditIcon}
                  onClick={handleEdit}
                />
                <Dropdown>
                  <Dropdown.Toggle
                    id={id}
                    as={IconButton}
                    src={MoveVertIcon}
                    alt={intl.formatMessage(messages.blockActionsDropdownAlt)}
                    iconAs={Icon}
                  />
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => unitXBlockActions.handleDuplicate(id)}>
                      {intl.formatMessage(messages.blockLabelButtonDuplicate)}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleXBlockMove}>
                      {intl.formatMessage(messages.blockLabelButtonMove)}
                    </Dropdown.Item>
                    {canEdit && (
                      <Dropdown.Item onClick={() => dispatch(copyToClipboard(id))}>
                        {intl.formatMessage(messages.blockLabelButtonCopyToClipboard)}
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item onClick={openConfigureModal}>
                      {intl.formatMessage(messages.blockLabelButtonManageAccess)}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={openDeleteModal}>
                      {intl.formatMessage(messages.blockLabelButtonDelete)}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <DeleteModal
                  category="component"
                  isOpen={isDeleteModalOpen}
                  close={closeDeleteModal}
                  onDeleteSubmit={onDeleteSubmit}
                />
                <ConfigureModal
                  isXBlockComponent
                  isOpen={isConfigureModalOpen}
                  onClose={closeConfigureModal}
                  onConfigureSubmit={onConfigureSubmit}
                  currentItemData={currentItemData}
                />
              </ActionRow>
            )}
          />
          <Card.Section>
            <XBlockMessages validationMessages={validationMessages} />
            <div className="w-100 bg-gray-100" style={{ height: 200 }} data-block-id={id} />
          </Card.Section>
        </Card>
      </div>
    </>
  );
};

CourseXBlock.defaultProps = {
  validationMessages: [],
  shouldScroll: false,
  renderError: undefined,
};

CourseXBlock.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  blockId: PropTypes.string.isRequired,
  renderError: PropTypes.string,
  shouldScroll: PropTypes.bool,
  validationMessages: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    text: PropTypes.string,
  })),
  unitXBlockActions: PropTypes.shape({
    handleDelete: PropTypes.func,
    handleDuplicate: PropTypes.func,
  }).isRequired,
  userPartitionInfo: PropTypes.shape({
    selectablePartitions: PropTypes.arrayOf(PropTypes.shape({
      groups: PropTypes.arrayOf(PropTypes.shape({
        deleted: PropTypes.bool,
        id: PropTypes.number,
        name: PropTypes.string,
        selected: PropTypes.bool,
      })),
      id: PropTypes.number,
      name: PropTypes.string,
      scheme: PropTypes.string,
    })),
    selectedPartitionIndex: PropTypes.number,
    selectedGroupsLabel: PropTypes.string,
  }).isRequired,
  handleConfigureSubmit: PropTypes.func.isRequired,
};

export default CourseXBlock;

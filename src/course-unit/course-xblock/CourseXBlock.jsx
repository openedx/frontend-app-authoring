import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import {
  ActionRow, Card, Dropdown, Icon, IconButton, useToggle,
} from '@openedx/paragon';
import { EditOutline as EditIcon, MoreVert as MoveVertIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getCanEdit, getCourseId } from 'CourseAuthoring/course-unit/data/selectors';
import DeleteModal from '../../generic/delete-modal/DeleteModal';
import ConfigureModal from '../../generic/configure-modal/ConfigureModal';
import SortableItem from '../../generic/drag-helper/SortableItem';
import { scrollToElement } from '../../course-outline/utils';
import { COURSE_BLOCK_NAMES } from '../../constants';
import { copyToClipboard } from '../../generic/data/thunks';
import { COMPONENT_TYPES } from '../constants';
import XBlockMessages from './xblock-messages/XBlockMessages';
import messages from './messages';

const CourseXBlock = ({
  id, title, type, unitXBlockActions, shouldScroll, userPartitionInfo,
  handleConfigureSubmit, validationMessages, ...props
}) => {
  const courseXBlockElementRef = useRef(null);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const canEdit = useSelector(getCanEdit);
  const courseId = useSelector(getCourseId);
  const intl = useIntl();

  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const isScrolledToElement = locatorId === id;

  const visibilityMessage = userPartitionInfo.selectedGroupsLabel
    ? intl.formatMessage(messages.visibilityMessage, { selectedGroupsLabel: userPartitionInfo.selectedGroupsLabel })
    : null;

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
    }
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
    <div
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
                  <Dropdown.Item>
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
  );
};

CourseXBlock.defaultProps = {
  validationMessages: [],
  shouldScroll: false,
};

CourseXBlock.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
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

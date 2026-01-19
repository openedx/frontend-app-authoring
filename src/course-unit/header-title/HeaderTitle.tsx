import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form, IconButton, useToggle,
} from '@openedx/paragon';
import {
  EditOutline as EditIcon,
  Settings as SettingsIcon,
} from '@openedx/paragon/icons';

import ConfigureModal from '@src/generic/configure-modal/ConfigureModal';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getCourseUnitData } from '../data/selectors';
import { updateQueryPendingStatus } from '../data/slice';
import messages from './messages';
import { isUnitPageNewDesignEnabled } from '../utils';

type HeaderTitleProps = {
  unitTitle: string;
  isTitleEditFormOpen: boolean;
  handleTitleEdit: () => void;
  handleTitleEditSubmit: (title: string) => void;
  handleConfigureSubmit: (
    id: string,
    isVisible: boolean,
    groupAccess: boolean,
    isDiscussionEnabled: boolean,
    closeModalFn: (value: boolean) => void
  ) => void;
};

const HeaderTitle = ({
  unitTitle,
  isTitleEditFormOpen,
  handleTitleEdit,
  handleTitleEditSubmit,
  handleConfigureSubmit,
}: HeaderTitleProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [titleValue, setTitleValue] = useState(unitTitle);
  const currentItemData = useSelector(getCourseUnitData);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);

  const isXBlockComponent = [
    COURSE_BLOCK_NAMES.libraryContent.id,
    COURSE_BLOCK_NAMES.splitTest.id,
    COURSE_BLOCK_NAMES.component.id,
  ].includes(currentItemData.category);

  const onConfigureSubmit = (...arg) => {
    handleConfigureSubmit(
      currentItemData.id,
      arg[0],
      arg[1],
      arg[2],
      closeConfigureModal,
    );
  };

  useEffect(() => {
    setTitleValue(unitTitle);
    dispatch(updateQueryPendingStatus(true));
  }, [unitTitle]);

  return (
    <div className="unit-header-title d-flex align-items-center lead" data-testid="unit-header-title">
      {isTitleEditFormOpen ? (
        <Form.Group className="m-0">
          <Form.Control
            ref={(e) => e && e.focus()}
            value={titleValue}
            name="displayName"
            onChange={(e) => setTitleValue(e.target.value)}
            aria-label={intl.formatMessage(messages.ariaLabelButtonEdit)}
            onBlur={() => handleTitleEditSubmit(titleValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTitleEditSubmit(titleValue);
              }
            }}
          />
        </Form.Group>
      ) : unitTitle}
      <IconButton
        alt={intl.formatMessage(messages.altButtonEdit)}
        className="ml-1 flex-shrink-0 edit-button"
        iconAs={EditIcon}
        onClick={handleTitleEdit}
      />
      {!isUnitPageNewDesignEnabled() && (
      <IconButton
        alt={intl.formatMessage(messages.altButtonSettings)}
        className="flex-shrink-0"
        iconAs={SettingsIcon}
        onClick={openConfigureModal}
      />
      )}
      <ConfigureModal
        isOpen={isConfigureModalOpen}
        onClose={closeConfigureModal}
        onConfigureSubmit={onConfigureSubmit}
        currentItemData={currentItemData}
        isSelfPaced={false}
        isXBlockComponent={isXBlockComponent}
      />
    </div>
  );
};

export default HeaderTitle;

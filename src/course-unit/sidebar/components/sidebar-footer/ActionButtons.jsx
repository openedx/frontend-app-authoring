import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { Divider } from '../../../../generic/divider';
import { getCanEdit, getCourseUnitData } from '../../../data/selectors';
import { copyToClipboard } from '../../../../generic/data/thunks';
import messages from '../../messages';

const ActionButtons = ({ openDiscardModal, handlePublishing }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const {
    id,
    published,
    hasChanges,
    enableCopyPasteUnits,
  } = useSelector(getCourseUnitData);
  const canEdit = useSelector(getCanEdit);

  return (
    <>
      {(!published || hasChanges) && (
        <Button size="sm" className="mt-3.5" variant="outline-primary" onClick={handlePublishing}>
          {intl.formatMessage(messages.actionButtonPublishTitle)}
        </Button>
      )}
      {(published && hasChanges) && (
        <Button
          size="sm"
          variant="link"
          onClick={openDiscardModal}
          className="course-unit-sidebar-footer__discard-changes__btn mt-2"
        >
          {intl.formatMessage(messages.actionButtonDiscardChangesTitle)}
        </Button>
      )}
      {enableCopyPasteUnits && canEdit && (
        <>
          <Divider className="course-unit-sidebar-footer__divider" />
          <Button
            onClick={() => dispatch(copyToClipboard(id))}
            variant="outline-primary"
            size="sm"
          >
            {intl.formatMessage(messages.actionButtonCopyUnitTitle)}
          </Button>
        </>
      )}
    </>
  );
};

ActionButtons.propTypes = {
  openDiscardModal: PropTypes.func.isRequired,
  handlePublishing: PropTypes.func.isRequired,
};

export default ActionButtons;

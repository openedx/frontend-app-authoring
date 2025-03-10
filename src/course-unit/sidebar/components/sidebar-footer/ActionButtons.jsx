import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { Divider } from '../../../../generic/divider';
import { getCanEdit, getCourseUnitData } from '../../../data/selectors';
import { useClipboard } from '../../../../generic/clipboard';
import messages from '../../messages';

const ActionButtons = ({ openDiscardModal, handlePublishing }) => {
  const intl = useIntl();
  const {
    id,
    published,
    hasChanges,
    enableCopyPasteUnits,
  } = useSelector(getCourseUnitData);
  const canEdit = useSelector(getCanEdit);
  const { copyToClipboard } = useClipboard();

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
            onClick={() => copyToClipboard(id)}
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

import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon, Stack, IconButtonWithTooltip,
} from '@openedx/paragon';
import {
  EditOutline as EditOutlineIcon, DeleteOutline as DeleteOutlineIcon,
} from '@openedx/paragon/icons';

import CertificateSection from '../certificate-section/CertificateSection';
import ModalNotification from '../../generic/modal-notification';
import commonMessages from '../messages';
import messages from './messages';
import useCertificateDetails from './hooks/useCertificateDetails';

const CertificateDetails = ({
  certificateId,
  detailsCourseTitle,
  courseTitleOverride,
  detailsCourseNumber,
  courseNumberOverride,
}) => {
  const intl = useIntl();
  const {
    isConfirmOpen,
    confirmOpen,
    confirmClose,
    isEditModalOpen,
    editModalOpen,
    editModalClose,
    isCertificateActive,
    handleEditAll,
    handleDeleteCard,
  } = useCertificateDetails(certificateId);

  return (
    <CertificateSection
      title={intl.formatMessage(messages.detailsSectionTitle)}
      className="certificate-details"
      data-testid="certificate-details"
      actions={(
        <Stack direction="horizontal" gap="2">
          <IconButtonWithTooltip
            src={EditOutlineIcon}
            iconAs={Icon}
            tooltipContent={<div>{intl.formatMessage(commonMessages.editTooltip)}</div>}
            alt={intl.formatMessage(commonMessages.editTooltip)}
            onClick={isCertificateActive ? editModalOpen : handleEditAll}
          />
          <IconButtonWithTooltip
            src={DeleteOutlineIcon}
            iconAs={Icon}
            tooltipContent={<div>{intl.formatMessage(commonMessages.deleteTooltip)}</div>}
            alt={intl.formatMessage(commonMessages.deleteTooltip)}
            onClick={confirmOpen}
          />
        </Stack>
      )}
    >
      <Stack>
        <Stack direction="horizontal" gap="1.5" className="certificate-details__info">
          <p className="certificate-details__info-paragraph">
            <strong>{intl.formatMessage(messages.detailsCourseTitle)}:</strong> {detailsCourseTitle}
          </p>
          <p className="certificate-details__info-paragraph-course-number">
            <strong>{intl.formatMessage(messages.detailsCourseNumber)}:</strong> {detailsCourseNumber}
          </p>
        </Stack>
        <Stack direction="horizontal" gap="1.5" className="certificate-details__info">
          {courseTitleOverride && (
            <p className="certificate-details__info-paragraph">
              <strong>{intl.formatMessage(messages.detailsCourseTitleOverride)}:</strong> {courseTitleOverride}
            </p>
          )}
          {courseNumberOverride && (
            <p className="certificate-details__info-paragraph text-right">
              <strong>{intl.formatMessage(messages.detailsCourseNumberOverride)}:</strong> {courseNumberOverride}
            </p>
          )}
        </Stack>
      </Stack>
      <ModalNotification
        isOpen={isEditModalOpen}
        title={intl.formatMessage(messages.editCertificateConfirmationTitle)}
        message={intl.formatMessage(messages.editCertificateMessage)}
        actionButtonText={intl.formatMessage(commonMessages.editTooltip)}
        cancelButtonText={intl.formatMessage(commonMessages.cardCancel)}
        handleCancel={editModalClose}
        handleAction={() => {
          editModalClose();
          handleEditAll();
        }}
      />
      <ModalNotification
        isOpen={isConfirmOpen}
        title={intl.formatMessage(messages.deleteCertificateConfirmationTitle)}
        message={intl.formatMessage(messages.deleteCertificateMessage)}
        actionButtonText={intl.formatMessage(commonMessages.deleteTooltip)}
        cancelButtonText={intl.formatMessage(commonMessages.cardCancel)}
        handleCancel={confirmClose}
        handleAction={() => {
          confirmClose();
          handleDeleteCard();
        }}
      />
    </CertificateSection>
  );
};

CertificateDetails.defaultProps = {
  courseTitleOverride: '',
  courseNumberOverride: '',
};

CertificateDetails.propTypes = {
  certificateId: PropTypes.number.isRequired,
  courseTitleOverride: PropTypes.string,
  courseNumberOverride: PropTypes.string,
  detailsCourseTitle: PropTypes.string.isRequired,
  detailsCourseNumber: PropTypes.string.isRequired,
};

export default CertificateDetails;

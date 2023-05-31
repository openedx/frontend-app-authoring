import React, { useCallback, useState, useMemo } from 'react';
import { injectIntl, useIntl } from '@edx/frontend-platform/i18n';
import { Button, ButtonGroup } from '@edx/paragon';
import classNames from 'classnames';

import { useFormikContext } from 'formik';
import ConfirmationPopup from '../../../../../generic/ConfirmationPopup';

import messages from '../../messages';
import { discussionRestrictionOptions, discussionRestriction } from '../../../data/constants';
import RestrictionSchedules from './discussion-restrictions/RestrictionSchedules';
// import DiscussionRestrictionOption from './discussion-restrictions/DiscussionRestrictionOption';

const DiscussionRestriction = () => {
  const {
    values: appConfig,
    setFieldValue,
  } = useFormikContext();

  const intl = useIntl();

  const { postingRestrictions } = appConfig;
  const [selectedRestrictionOption, setSelectedRestrictionOption] = useState(postingRestrictions);
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = useCallback((value) => {
    setShowPopup(value === discussionRestriction.ENABLED);
    setSelectedRestrictionOption(value);

    if (value !== discussionRestriction.ENABLED) {
      setFieldValue('postingRestrictions', value);
    }
  }, []);

  const handleConfirmation = () => {
    setShowPopup(false);
    setSelectedRestrictionOption(discussionRestriction.ENABLED);
    setFieldValue('postingRestrictions', discussionRestriction.ENABLED);
  };

  const handleCancel = () => {
    setShowPopup(false);
    setSelectedRestrictionOption(postingRestrictions);
  };

  const discussionRestrictionButtons = useMemo(() => discussionRestrictionOptions.map((restriction) => (
    <Button
      key={`restriction-${restriction.value}`}
      variant="plain"
      className={classNames('w-100 font-size-14 font-weight-500 line-height-20 py-7px border-light-400 unselected-button', {
        'text-white bg-primary-500 selected-button': selectedRestrictionOption === restriction.value,
      })}
      onClick={() => handleClick(restriction.value)}
    >
      {restriction.label}
    </Button>
    )), [selectedRestrictionOption]);

  return (
    <div className="discussion-restriction">
      <h5 className="text-gray-500 mt-4 mb-3 line-height-20">
        {intl.formatMessage(messages.discussionRestrictionLabel)}
      </h5>
      <ButtonGroup className="mb-2 w-100" toggle size="sm">
        {discussionRestrictionButtons}
      </ButtonGroup>

      <div className="small text-muted font-size-14 height-24">
        {(selectedRestrictionOption === discussionRestriction.DISABLED
          || selectedRestrictionOption === discussionRestriction.ENABLED)
          ? intl.formatMessage(messages.discussionRestrictionHelp)
          : intl.formatMessage(messages.discussionRestrictionDatesHelp)}
      </div>

      {showPopup && (
      <ConfirmationPopup
        label={intl.formatMessage(messages.enableRestrictedDatesConfirmationLabel)}
        bodyText={intl.formatMessage(messages.enableRestrictedDatesConfirmationHelp)}
        onCancel={handleCancel}
        onConfirm={handleConfirmation}
        confirmLabel={intl.formatMessage(messages.ok)}
        cancelLabel={intl.formatMessage(messages.cancelButton)}
        confirmVariant="plain"
        confirmButtonClass="bg-primary-500 text-white rounded-0 action-btn"
        cancelButtonClass="rounded-0 action-btn w-92"
        sectionClasses="card-body-section"
      />
      )}

      {selectedRestrictionOption === discussionRestriction.SCHEDULED && <RestrictionSchedules />}
    </div>
  );
};

export default injectIntl(React.memo(DiscussionRestriction));

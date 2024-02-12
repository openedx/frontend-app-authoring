import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Form } from '@edx/paragon';
import { FormattedMessage, injectIntl, useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { COURSE_BLOCK_NAMES } from '../constants';

const VisibilityTab = ({
  category,
  isVisibleToStaffOnly,
  setIsVisibleToStaffOnly,
  showWarning,
  isSubsection,
  hideAfterDue,
  setHideAfterDue,
  showCorrectness,
  setShowCorrectness,
}) => {
  const intl = useIntl();
  const visibilityTitle = COURSE_BLOCK_NAMES[category]?.name;
  const handleChange = (e) => {
    setIsVisibleToStaffOnly(e.target.checked);
  };

  const getVisibilityValue = () => {
    if (isVisibleToStaffOnly) {
      return 'hide';
    }
    if (hideAfterDue) {
      return 'hideDue';
    }
    return 'show';
  };

  const visibilityChanged = (e) => {
    const selected = e.target.value;
    if (selected === 'hide') {
      setIsVisibleToStaffOnly(true);
      setHideAfterDue(false);
    } else if (selected === 'hideDue') {
      setIsVisibleToStaffOnly(false);
      setHideAfterDue(true);
    } else {
      setIsVisibleToStaffOnly(false);
      setHideAfterDue(false);
    }
  };

  const correctnessChanged = (e) => {
    setShowCorrectness(e.target.value);
  };

  return (
    <>
      <h5 className="mt-4 text-gray-700">
        {intl.formatMessage(messages.visibilitySectionTitle, { visibilityTitle })}
      </h5>
      <hr />
      {
        isSubsection ? (
          <>
            <Form.RadioSet
              name="subsectionVisibility"
              onChange={visibilityChanged}
              value={getVisibilityValue()}
            >
              <Form.Radio value="show">
                <FormattedMessage {...messages.showEntireSubsection} />
              </Form.Radio>
              <Form.Text><FormattedMessage {...messages.showEntireSubsectionDescription} /></Form.Text>
              <Form.Radio value="hideDue">
                <FormattedMessage {...messages.hideContentAfterDue} />
              </Form.Radio>
              <Form.Text><FormattedMessage {...messages.hideContentAfterDueDescription} /></Form.Text>
              <Form.Radio value="hide">
                <FormattedMessage {...messages.hideEntireSubsection} />
              </Form.Radio>
              <Form.Text><FormattedMessage {...messages.hideEntireSubsectionDescription} /></Form.Text>
            </Form.RadioSet>
            <h5 className="mt-4 text-gray-700"><FormattedMessage {...messages.assessmentResultsVisibility} /></h5>
            <Form.RadioSet
              name="assessmentResultsVisibility"
              onChange={correctnessChanged}
              value={showCorrectness}
            >
              <Form.Radio value="always">
                <FormattedMessage {...messages.alwaysShowAssessmentResults} />
              </Form.Radio>
              <Form.Text><FormattedMessage {...messages.alwaysShowAssessmentResultsDescription} /></Form.Text>
              <Form.Radio value="never">
                <FormattedMessage {...messages.neverShowAssessmentResults} />
              </Form.Radio>
              <Form.Text><FormattedMessage {...messages.neverShowAssessmentResultsDescription} /></Form.Text>
              <Form.Radio value="past_due">
                <FormattedMessage {...messages.showAssessmentResultsPastDue} />
              </Form.Radio>
              <Form.Text><FormattedMessage {...messages.showAssessmentResultsPastDueDescription} /></Form.Text>
            </Form.RadioSet>
          </>
        ) : (
          <Form.Checkbox checked={isVisibleToStaffOnly} onChange={handleChange} data-testid="visibility-checkbox">
            <FormattedMessage {...messages.hideFromLearners} />
          </Form.Checkbox>
        )
      }
      {showWarning && (
        <>
          <hr />
          <Alert variant="warning">
            <FormattedMessage {...messages.sectionVisibilityWarning} />
          </Alert>
        </>

      )}
    </>
  );
};

VisibilityTab.propTypes = {
  category: PropTypes.string.isRequired,
  isVisibleToStaffOnly: PropTypes.bool.isRequired,
  showWarning: PropTypes.bool.isRequired,
  setIsVisibleToStaffOnly: PropTypes.func.isRequired,
  isSubsection: PropTypes.bool.isRequired,
  hideAfterDue: PropTypes.bool.isRequired,
  setHideAfterDue: PropTypes.func.isRequired,
  showCorrectness: PropTypes.string.isRequired,
  setShowCorrectness: PropTypes.func.isRequired,
};

export default injectIntl(VisibilityTab);

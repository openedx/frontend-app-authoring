import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, TransitionReplace } from '@edx/paragon';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import FormSwitchGroup from '../../../../generic/FormSwitchGroup';
import messages from './messages';

function LegacyConfigForm({
  appConfig, onSubmit, intl, formRef,
}) {
  // TODO: This regex doesn't seem to be working yet/validation isn't displaying.  Unclear why.
  const blackoutDateRegex = /(\[\]|\[(\["\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}){0,1}"\])*\])/;
  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    errors,
  } = useFormik({
    initialValues: appConfig,
    validationSchema: Yup.object().shape({
      blackoutDates: Yup.string().matches(blackoutDateRegex, 'bad regex'),

    }),
    onSubmit,
  });

  const divider = <hr className="my-2" />;

  return (
    <Form ref={formRef} onSubmit={handleSubmit}>
      <h5>{intl.formatMessage(messages.divisionByGroup)}</h5>

      <FormSwitchGroup
        onChange={handleChange}
        onBlur={handleBlur}
        id="divideByCohorts"
        checked={values.divideByCohorts}
        label={intl.formatMessage(messages.divideByCohortsLabel)}
        helpText={intl.formatMessage(messages.divideByCohortsHelp)}
      />
      <TransitionReplace>
        {values.divideByCohorts ? (
          <React.Fragment key="open">
            <FormSwitchGroup
              onChange={handleChange}
              onBlur={handleBlur}
              className="pl-4"
              id="allowDivisionByUnit"
              checked={values.allowDivisionByUnit}
              label={intl.formatMessage(messages.allowDivisionByUnitLabel)}
              helpText={intl.formatMessage(messages.allowDivisionByUnitHelp)}
            />
            <FormSwitchGroup
              onChange={handleChange}
              onBlur={handleBlur}
              id="divideCourseWideTopics"
              checked={values.divideCourseWideTopics}
              label={intl.formatMessage(messages.divideCourseWideTopicsLabel)}
              helpText={intl.formatMessage(messages.divideCourseWideTopicsHelp)}
            />
            <Form.Group>
              <Form.Check
                onChange={handleChange}
                onBlur={handleBlur}
                checked={values.divideGeneralTopic}
                label="General"
              />
              <Form.Check
                onChange={handleChange}
                onBlur={handleBlur}
                checked={values.divideQuestionsForTAs}
                label="Questions for the TAs"
              />
            </Form.Group>
          </React.Fragment>
        ) : <React.Fragment key="closed" />}
      </TransitionReplace>

      {divider}

      <h5>{intl.formatMessage(messages.visibilityInContext)}</h5>
      <FormSwitchGroup
        onChange={handleChange}
        onBlur={handleBlur}
        id="inContextDiscussion"
        checked={values.inContextDiscussion}
        label={intl.formatMessage(messages.inContextDiscussionLabel)}
        helpText={intl.formatMessage(messages.inContextDiscussionHelp)}
      />
      <TransitionReplace>
        {values.inContextDiscussion ? (
          <React.Fragment key="open">
            <FormSwitchGroup
              onChange={handleChange}
              onBlur={handleBlur}
              className="pl-4"
              id="gradedUnitPages"
              checked={values.gradedUnitPages}
              label={intl.formatMessage(messages.gradedUnitPagesLabel)}
              helpText={intl.formatMessage(messages.gradedUnitPagesHelp)}
            />
            <FormSwitchGroup
              onChange={handleChange}
              onBlur={handleBlur}
              className="pl-4"
              id="groupInContextSubsection"
              checked={values.groupInContextSubsection}
              label={intl.formatMessage(messages.groupInContextSubsectionLabel)}
              helpText={intl.formatMessage(messages.groupInContextSubsectionHelp)}
            />
            <FormSwitchGroup
              onChange={handleChange}
              onBlur={handleBlur}
              className="pl-4"
              id="allowUnitLevelVisibility"
              checked={values.allowUnitLevelVisibility}
              label={intl.formatMessage(messages.allowUnitLevelVisibilityLabel)}
              helpText={intl.formatMessage(messages.allowUnitLevelVisibilityHelp)}
            />
          </React.Fragment>
        ) : <React.Fragment key="closed" />}

      </TransitionReplace>

      {divider}
      <h5>{intl.formatMessage(messages.anonymousPosting)}</h5>
      <FormSwitchGroup
        onChange={handleChange}
        onBlur={handleBlur}
        id="allowAnonymousPosts"
        checked={values.allowAnonymousPosts}
        label={intl.formatMessage(messages.allowAnonymousPostsLabel)}
        helpText={intl.formatMessage(messages.allowAnonymousPostsHelp)}
      />
      <FormSwitchGroup
        onChange={handleChange}
        onBlur={handleBlur}
        id="allowAnonymousPostsPeers"
        checked={values.allowAnonymousPostsPeers}
        label={intl.formatMessage(messages.allowAnonymousPostsPeersLabel)}
        helpText={intl.formatMessage(messages.allowAnonymousPostsPeersHelp)}
      />
      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.blackoutDatesLabel)}</Form.Label>
        <Form.Control
          id="blackoutDates"
          aria-describedby="blackoutDatesHelpText"
          value={values.blackoutDates}
          onChange={handleChange}
          onBlur={handleBlur}
          className={{ 'is-invalid': !!errors.launchUrl }}
        />
        <Form.Control.Feedback id="blackoutDatesFeedback" type="invalid">
          Bad blackout date
        </Form.Control.Feedback>
        <Form.Text id="blackoutDatesHelpText" muted>
          {intl.formatMessage(messages.blackoutDatesHelp)}
        </Form.Text>
      </Form.Group>
    </Form>
  );
}

LegacyConfigForm.propTypes = {
  appConfig: PropTypes.shape({
    divideByCohorts: PropTypes.bool.isRequired,
    allowDivisionByUnit: PropTypes.bool.isRequired,
    divideCourseWideTopics: PropTypes.bool.isRequired,
    divideGeneralTopic: PropTypes.bool.isRequired,
    divideQuestionsForTAs: PropTypes.bool.isRequired,
    inContextDiscussion: PropTypes.bool.isRequired,
    gradedUnitPages: PropTypes.bool.isRequired,
    groupInContextSubsection: PropTypes.bool.isRequired,
    allowUnitLevelVisibility: PropTypes.bool.isRequired,
    allowAnonymousPosts: PropTypes.bool.isRequired,
    allowAnonymousPostsPeers: PropTypes.bool.isRequired,
    blackoutDates: PropTypes.string.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
};

export default injectIntl(LegacyConfigForm);

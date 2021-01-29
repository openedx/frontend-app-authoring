import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  StatefulButton, Form, Button, Hyperlink,
} from '@edx/paragon';
import { useRouteMatch } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { history } from '@edx/frontend-platform';
import messages from './messages';
import { useModel } from '../../generic/model-store';
import { fetchAppConfig, saveAppConfig } from './data/thunks';
import {
  DIRTY,
  LOADED,
  SAVED,
  SAVING,
  updateStatus,
} from './data/slice';

function DiscussionConfig({ courseId, intl }) {
  const { params: { appId } } = useRouteMatch();

  const [drafts, setDrafts] = useState({});

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAppConfig(courseId, appId));
  }, [courseId]);

  const { activeAppId, activeAppConfigId, status } = useSelector(state => state.discussions);

  const app = useModel('apps', activeAppId);
  const appConfig = useModel('appConfigs', activeAppConfigId);

  const handleChange = useCallback((event) => {
    const { id, value } = event.target;
    setDrafts({ ...drafts, [id]: value });
    if (status !== DIRTY) {
      dispatch(updateStatus({ courseId, status: DIRTY }));
    }
  }, [drafts]);

  const handleSubmit = useCallback((event) => {
    dispatch(saveAppConfig(courseId, appId, drafts));
    event.preventDefault();
  }, [drafts]);

  useEffect(() => {
    if (status === SAVED) {
      setDrafts({});
      setTimeout(() => {
        dispatch(updateStatus({ courseId, status: LOADED }));
      }, 2000);
    }
  }, [status]);

  if (!appConfig) {
    return null;
  }

  const consumerKey = drafts.consumerKey !== undefined
    ? drafts.consumerKey : appConfig.consumerKey;
  const consumerSecret = drafts.consumerSecret !== undefined
    ? drafts.consumerSecret : appConfig.consumerSecret;
  const launchUrl = drafts.launchUrl !== undefined
    ? drafts.launchUrl : appConfig.launchUrl;

  const consumerKeyValid = drafts.consumerKey === undefined
    || drafts.consumerKey.length > 0;
  const consumerSecretValid = drafts.consumerSecret === undefined
    || drafts.consumerSecret.length > 0;
  const launchUrlValid = drafts.launchUrl === undefined
    || drafts.launchUrl.length > 0;

  let submitButtonState;
  switch (status) {
    case SAVING:
      submitButtonState = 'pending';
      break;
    case SAVED:
      submitButtonState = 'complete';
      break;
    default:
      submitButtonState = 'default';
  }

  return (
    <Form className="m-5" onSubmit={handleSubmit}>
      <h1>{intl.formatMessage(messages.configureApp, { name: app.name })}</h1>
      <p>
        <FormattedMessage
          id="authoring.discussions.appDocInstructions"
          defaultMessage="Please visit the {documentationPageLink} for {name} to set up the tool, then paste your consumer key and consumer secret here."
          description="Instructions for the user to go visit a third party app's documentation to learn how to generate a set of values needed in this form."
          values={{
            documentationPageLink: (
              <Hyperlink href={app.documentationUrl}>{intl.formatMessage(messages.documentationPage)}</Hyperlink>
            ),
            name: app.name,
          }}
        />

      </p>
      <Form.Group controlId="consumerKey">
        <Form.Label>{intl.formatMessage(messages.consumerKey)}</Form.Label>
        <Form.Control
          onChange={handleChange}
          value={consumerKey}
          className={{ 'is-invalid': !consumerKeyValid }}
          aria-describedby="consumerKeyFeedback"
        />
        <Form.Control.Feedback id="consumerKeyFeedback" type="invalid">
          {intl.formatMessage(messages.consumerKeyRequired)}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="consumerSecret">
        <Form.Label>{intl.formatMessage(messages.consumerSecret)}</Form.Label>
        <Form.Control
          onChange={handleChange}
          value={consumerSecret}
          className={{ 'is-invalid': !consumerSecretValid }}
          aria-describedby="consumerSecretFeedback"
        />
        <Form.Control.Feedback id="consumerSecretFeedback" type="invalid">
          {intl.formatMessage(messages.consumerSecretRequired)}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="launchUrl">
        <Form.Label>{intl.formatMessage(messages.launchUrl)}</Form.Label>
        <Form.Control
          onChange={handleChange}
          value={launchUrl}
          className={{ 'is-invalid': !launchUrlValid }}
          aria-describedby="launchUrlFeedback"
        />
        <Form.Control.Feedback id="launchUrlFeedback" type="invalid">
          {intl.formatMessage(messages.launchUrlRequired)}
        </Form.Control.Feedback>
      </Form.Group>
      <StatefulButton
        labels={{
          default: intl.formatMessage(messages.saveConfig),
          pending: intl.formatMessage(messages.savingConfig),
          complete: intl.formatMessage(messages.savedConfig),
        }}
        type="submit"
        state={submitButtonState}
        className="mr-3"
      />
      <Button variant="link" onClick={() => history.push(`/course/${courseId}/pages-and-resources/discussion`)}>{intl.formatMessage(messages.backButton)}</Button>
    </Form>
  );
}

DiscussionConfig.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionConfig);

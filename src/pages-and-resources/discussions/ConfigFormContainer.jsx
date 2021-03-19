import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { Card, Container } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useModel } from '../../generic/model-store';
import { fetchAppConfig } from './data/thunks';
import LegacyConfigForm from './apps/legacy';
import LtiConfigForm from './apps/lti';
import messages from './messages';

function ConfigFormContainer({
  courseId, onSubmit, formRef, intl,
}) {
  const { params: { appId: routeAppId } } = useRouteMatch();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAppConfig(courseId, routeAppId));
  }, [courseId]);

  const { activeAppId, activeAppConfigId } = useSelector(state => state.discussions);

  const app = useModel('apps', activeAppId);
  const appConfig = useModel('appConfigs', activeAppConfigId);

  if (!appConfig || !app) {
    return null;
  }

  let form = null;

  if (app.id === 'legacy') {
    form = (
      <LegacyConfigForm
        formRef={formRef}
        appConfig={appConfig}
        onSubmit={onSubmit}
      />
    );
  } else {
    form = (
      <LtiConfigForm
        formRef={formRef}
        app={app}
        appConfig={appConfig}
        onSubmit={onSubmit}
      />
    );
  }
  return (
    <Container size="xs" className="px-sm-0">
      <h3 className="my-4">
        {intl.formatMessage(messages.configureApp, { name: app.name })}
      </h3>
      <Card className="mb-5 p-5">
        {form}
      </Card>
    </Container>
  );
}

ConfigFormContainer.propTypes = {
  courseId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(ConfigFormContainer);

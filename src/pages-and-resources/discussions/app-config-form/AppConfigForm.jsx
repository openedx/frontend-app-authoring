import React, {
  useCallback, useContext, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { Container } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { history } from '@edx/frontend-platform';
import { useModel } from '../../../generic/model-store';
import { fetchAppConfig, saveAppConfig } from './data/thunks';
import LegacyConfigForm from './apps/legacy';
import LtiConfigForm from './apps/lti';
import messages from './messages';
import { PagesAndResourcesContext } from '../../PagesAndResourcesProvider';
import AppConfigFormProvider from './AppConfigFormProvider';
import AppConfigFormApplyButton from './AppConfigFormApplyButton';

function AppConfigForm({
  courseId, intl,
}) {
  const { params: { appId: routeAppId } } = useRouteMatch();
  const formRef = useRef();
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAppConfig(courseId, routeAppId));
  }, [courseId]);

  const { appId, appConfigId } = useSelector(state => state.discussions.appConfigForm);

  // This is a callback that gets called after the form has been submitted successfully.
  const handleSubmit = useCallback((values) => {
    dispatch(saveAppConfig(courseId, appId, values)).then(() => {
      history.push(pagesAndResourcesPath);
    });
  }, [courseId, appId, courseId]);

  const app = useModel('apps', appId);
  const appConfig = useModel('appConfigs', appConfigId);

  if (!appConfig || !app) {
    return null;
  }

  let form = null;

  if (app.id === 'legacy') {
    form = (
      <LegacyConfigForm
        formRef={formRef}
        appConfig={appConfig}
        onSubmit={handleSubmit}
        title={intl.formatMessage(messages[`appName-${app.id}`])}
      />
    );
  } else {
    form = (
      <LtiConfigForm
        formRef={formRef}
        app={app}
        appConfig={appConfig}
        onSubmit={handleSubmit}
        title={intl.formatMessage(messages[`appName-${app.id}`])}
      />
    );
  }
  return (
    <Container size="sm" className="px-sm-0 py-5">
      {form}
    </Container>
  );
}

AppConfigForm.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

const IntlAppConfigForm = injectIntl(AppConfigForm);

IntlAppConfigForm.Provider = AppConfigFormProvider;
IntlAppConfigForm.ApplyButton = AppConfigFormApplyButton;

export default IntlAppConfigForm;

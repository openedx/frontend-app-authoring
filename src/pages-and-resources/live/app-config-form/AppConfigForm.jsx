import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';

import { Container } from '@edx/paragon';

import Loading from '../../../generic/Loading';
import PermissionDeniedAlert from '../../../generic/PermissionDeniedAlert';
import SaveFormConnectionErrorAlert from '../../../generic/SaveFormConnectionErrorAlert';
import { PagesAndResourcesContext } from '../../PagesAndResourcesProvider';
import {
  DENIED, FAILED, LOADED, LOADING, selectApp,
} from '../data/slice';
import { fetchLiveSettings, saveProviderConfig } from '../data/thunks';
import LtiConfigForm from './apps/lti';
import AppConfigFormProvider, { AppConfigFormContext } from './AppConfigFormProvider';
import AppConfigFormSaveButton from './AppConfigFormSaveButton';

function AppConfigForm({ courseId }) {
  const dispatch = useDispatch();

  const { formRef } = useContext(AppConfigFormContext);
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);
  const { params: { appId: routeAppId } } = useRouteMatch();
  const [isLoading, setLoading] = useState(true);
  const { selectedAppId, status, saveStatus } = useSelector(state => state.live);

  useEffect(() => {
    (async () => {
      await dispatch(fetchLiveSettings(courseId, selectedAppId));
      setLoading(false);
    })();
  }, [courseId, selectedAppId]);

  useEffect(() => {
    if (status === LOADED) {
      if (routeAppId !== selectedAppId) {
        dispatch(selectApp({ appId: routeAppId }));
      }
    }
  }, [selectedAppId, routeAppId, status]);

  // This is a callback that gets called after the form has been submitted successfully.
  const handleSubmit = useCallback((values) => (
    // Note that when this action succeeds, we redirect to pagesAndResourcesPath in the thunk.
    dispatch(saveProviderConfig(courseId, selectedAppId, values, pagesAndResourcesPath))),
  [courseId, selectedAppId]);

  if (!selectedAppId || status === LOADING || isLoading) {
    return (
      <Loading />
    );
  }

  let alert = null;
  if (saveStatus === FAILED) {
    alert = (
      <SaveFormConnectionErrorAlert />
    );
  }
  if (saveStatus === DENIED) {
    alert = <PermissionDeniedAlert />;
  }

  return (
    <Container size="sm" className="px-sm-0 py-sm-5 p-0" data-testid="appConfigForm">
      {alert}
      <LtiConfigForm
        formRef={formRef}
        onSubmit={handleSubmit}
      />
    </Container>
  );
}

AppConfigForm.propTypes = {
  courseId: PropTypes.string.isRequired,
};

AppConfigForm.Provider = AppConfigFormProvider;
AppConfigForm.SaveButton = AppConfigFormSaveButton;

export default AppConfigForm;

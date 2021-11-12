import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Container,
  ModalDialog,
} from '@edx/paragon';

import Loading from '../../../generic/Loading';
import PermissionDeniedAlert from '../../../generic/PermissionDeniedAlert';
import SaveFormConnectionErrorAlert from '../../../generic/SaveFormConnectionErrorAlert';
import { PagesAndResourcesContext } from '../../PagesAndResourcesProvider';
import {
  DENIED,
  FAILED, LOADED, LOADING, selectApp,
} from '../data/slice';
import { saveAppConfig } from '../data/thunks';
import LegacyConfigForm from './apps/legacy';
import LtiConfigForm from './apps/lti';
import AppConfigFormProvider, { AppConfigFormContext } from './AppConfigFormProvider';
import AppConfigFormSaveButton from './AppConfigFormSaveButton';
import messages from './messages';

function AppConfigForm({
  courseId, intl,
}) {
  const dispatch = useDispatch();

  const { formRef } = useContext(AppConfigFormContext);
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);
  const { params: { appId: routeAppId } } = useRouteMatch();
  const {
    activeAppId, selectedAppId, status, saveStatus,
  } = useSelector(state => state.discussions);

  const [confirmationDialogVisible, setConfirmationDialogVisible] = useState(false);

  useEffect(() => {
    if (status === LOADED) {
      if (routeAppId !== selectedAppId) {
        dispatch(selectApp({ appId: routeAppId }));
      }
    }
  }, [selectedAppId, routeAppId, status]);

  // This is a callback that gets called after the form has been submitted successfully.
  const handleSubmit = useCallback((values) => {
    const needsConfirmation = (activeAppId !== selectedAppId);
    if (needsConfirmation && !confirmationDialogVisible) {
      setConfirmationDialogVisible(true);
    } else {
      setConfirmationDialogVisible(false);
      // Note that when this action succeeds, we redirect to pagesAndResurcesPath in the thunk.
      dispatch(saveAppConfig(courseId, selectedAppId, values, pagesAndResourcesPath));
    }
  }, [activeAppId, confirmationDialogVisible, courseId, selectedAppId]);

  if (!selectedAppId || status === LOADING) {
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

  let form = null;
  if (selectedAppId === 'legacy') {
    form = (
      <LegacyConfigForm
        formRef={formRef}
        onSubmit={handleSubmit}
      />
    );
  } else {
    form = (
      <LtiConfigForm
        formRef={formRef}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <Container size="sm" className="px-sm-0 py-sm-5 p-0" data-testid="appConfigForm">
      {alert}
      {form}
      <ModalDialog
        hasCloseButton={false}
        isOpen={confirmationDialogVisible}
        onClose={() => setConfirmationDialogVisible(false)}
        title={intl.formatMessage(messages.ok)}
      >
        <ModalDialog.Header className="pt-4">
          <ModalDialog.Title className="h4 m-0" style={{ fontSize: '1.125rem' }}>
            {intl.formatMessage(messages.confirmConfigurationChange)}
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body className="overflow-hidden text-primary-700">
          {intl.formatMessage(messages.configurationChangeConsequence)}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              {intl.formatMessage(messages.cancel)}
            </ModalDialog.CloseButton>
            <AppConfigFormSaveButton labelText={intl.formatMessage(messages.ok)} />
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </Container>
  );
}

AppConfigForm.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

const IntlAppConfigForm = injectIntl(AppConfigForm);

IntlAppConfigForm.Provider = AppConfigFormProvider;
IntlAppConfigForm.SaveButton = AppConfigFormSaveButton;

export default IntlAppConfigForm;

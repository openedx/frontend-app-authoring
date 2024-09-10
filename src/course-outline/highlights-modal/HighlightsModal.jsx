import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Button,
  ActionRow,
  Hyperlink,
} from '@openedx/paragon';
import { Formik } from 'formik';
import { useSelector } from 'react-redux';

import { useHelpUrls } from '../../help-urls/hooks';
import FormikControl from '../../generic/FormikControl';
import { getCurrentSection } from '../data/selectors';
import { HIGHLIGHTS_FIELD_MAX_LENGTH } from '../constants';
import { getHighlightsFormValues } from '../utils';
import messages from './messages';

const HighlightsModal = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const intl = useIntl();
  const { highlights = [], displayName } = useSelector(getCurrentSection);
  const initialFormValues = getHighlightsFormValues(highlights);

  const {
    contentHighlights: contentHighlightsUrl,
  } = useHelpUrls(['contentHighlights']);

  return (
    <ModalDialog
      title={displayName}
      className="highlights-modal"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header className="highlights-modal__header">
        <ModalDialog.Title>
          {intl.formatMessage(messages.title, {
            title: displayName,
          })}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <Formik initialValues={initialFormValues} onSubmit={onSubmit}>
        {({ values, dirty, handleSubmit }) => (
          <>
            <ModalDialog.Body>
              <p className="mb-4.5 pb-2">
                {intl.formatMessage(messages.description, {
                  documentation: (
                    <Hyperlink destination={contentHighlightsUrl} target="_blank" showLaunchIcon={false}>
                      {intl.formatMessage(messages.documentationLink)}
                    </Hyperlink>),
                })}
              </p>
              {Object.entries(initialFormValues).map(([key], index) => (
                <FormikControl
                  key={key}
                  name={key}
                  value={values[key]}
                  floatingLabel={intl.formatMessage(messages.highlight, { index: index + 1 })}
                  maxLength={HIGHLIGHTS_FIELD_MAX_LENGTH}
                  as="textarea"
                />
              ))}
            </ModalDialog.Body>
            <ModalDialog.Footer className="pt-1">
              <ActionRow>
                <ModalDialog.CloseButton variant="tertiary">
                  {intl.formatMessage(messages.cancelButton)}
                </ModalDialog.CloseButton>
                <Button disabled={!dirty} onClick={handleSubmit}>
                  {intl.formatMessage(messages.saveButton)}
                </Button>
              </ActionRow>
            </ModalDialog.Footer>
          </>
        )}
      </Formik>
    </ModalDialog>
  );
};

HighlightsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default HighlightsModal;

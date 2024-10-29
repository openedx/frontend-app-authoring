import React from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {
  ActionRow,
  Button,
  Icon,
  ModalDialog,
  IconButton,
} from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

import { EditorModalBody, EditorModalWrapper, FooterWrapper } from '../../../../EditorContainer';
import { actions, selectors } from '../../../../../data/redux';
import * as containerHooks from '../../../../EditorContainer/hooks';
import * as hooks from '../hooks';
import ecMessages from '../../../../EditorContainer/messages';
import messages from './messages';

interface Props {
  selected: string;
  onClose: (() => void) | null;
}

const SelectTypeWrapper: React.FC<Props> = ({
  children,
  onClose = null,
  selected,
}) => {
  const handleCancel = containerHooks.handleCancel({ onClose });
  const intl = useIntl();
  const defaultSettings = useSelector(selectors.problem.defaultSettings);
  const dispatch = useDispatch();
  const updateField = React.useCallback((data) => dispatch(actions.problem.updateField(data)), [dispatch]);
  const setBlockTitle = React.useCallback((title) => dispatch(actions.app.setBlockTitle(title)), [dispatch]);

  return (
    <EditorModalWrapper onClose={handleCancel}>
      <ModalDialog.Header className="shadow-sm zindex-10">
        <ModalDialog.Title>
          <FormattedMessage {...messages.selectTypeTitle} />
          <div className="pgn__modal-close-container">
            <IconButton
              src={Close}
              iconAs={Icon}
              onClick={handleCancel}
              alt={intl.formatMessage(ecMessages.exitButtonAlt)}
            />
          </div>
        </ModalDialog.Title>
      </ModalDialog.Header>
      <EditorModalBody>
        {children}
      </EditorModalBody>
      <FooterWrapper>
        <ModalDialog.Footer className="border-top-0">
          <ActionRow>
            <ActionRow.Spacer />
            <Button
              aria-label={intl.formatMessage(messages.cancelButtonAriaLabel)}
              variant="tertiary"
              onClick={handleCancel}
            >
              <FormattedMessage {...messages.cancelButtonLabel} />
            </Button>
            <Button
              aria-label={intl.formatMessage(messages.selectButtonAriaLabel)}
              onClick={hooks.onSelect({
                selected,
                updateField,
                setBlockTitle,
                defaultSettings,
              })}
              disabled={!selected}
            >
              <FormattedMessage {...messages.selectButtonLabel} />
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </FooterWrapper>
    </EditorModalWrapper>
  );
};

export default SelectTypeWrapper;

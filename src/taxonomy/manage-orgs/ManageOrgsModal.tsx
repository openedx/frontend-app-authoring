import React, { useContext, useEffect, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  useToggle,
  ActionRow,
  AlertModal,
  Button,
  Chip,
  Container,
  Form,
  ModalDialog,
  Stack,
} from '@openedx/paragon';
import {
  Close,
  Warning,
} from '@openedx/paragon/icons';

import { useOrganizationListData } from '../../generic/data/apiHooks';
import { TaxonomyContext } from '../common/context';
import { useTaxonomyDetails } from '../data/apiHooks';
import { useManageOrgs } from './data/api';
import messages from './messages';
import './ManageOrgsModal.scss';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirm: () => void;
  taxonomyName: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  confirm,
  taxonomyName,
}) => {
  const intl = useIntl();
  return (
    <AlertModal
      title={intl.formatMessage(messages.confirmUnassignTitle)}
      isOpen={isOpen}
      onClose={onClose}
      variant="warning"
      icon={Warning}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={onClose}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button variant="primary" onClick={confirm}>
            {intl.formatMessage(messages.continueButton)}
          </Button>
        </ActionRow>
      )}
    >
      <p>
        {intl.formatMessage(messages.confirmUnassignText, { taxonomyName })}
      </p>
    </AlertModal>
  );
};

interface ManageOrgsModalProps {
  taxonomyId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ManageOrgsModal: React.FC<ManageOrgsModalProps> = ({
  taxonomyId,
  isOpen,
  onClose,
}) => {
  const intl = useIntl();
  const { setToastMessage } = useContext(TaxonomyContext);

  const [selectedOrgs, setSelectedOrgs] = useState<string[] | null>(null);
  const [allOrgs, setAllOrgs] = useState<boolean | null>(null);

  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useToggle(false);

  const [isDialogDisabled, disableDialog, enableDialog] = useToggle(false);

  const {
    data: organizationListData,
  } = useOrganizationListData();

  const { data: taxonomy } = useTaxonomyDetails(taxonomyId);

  const manageOrgMutation = useManageOrgs();

  const saveOrgs = async () => {
    disableDialog();
    closeConfirmModal();
    if (selectedOrgs !== null && allOrgs !== null) {
      try {
        await manageOrgMutation.mutateAsync({
          taxonomyId,
          orgs: allOrgs ? undefined : selectedOrgs,
          allOrgs,
        });
        if (setToastMessage) {
          setToastMessage(intl.formatMessage(messages.assignOrgsSuccess));
        }
      } catch (error) {
        // ToDo: display the error to the user
      } finally {
        enableDialog();
        onClose();
      }
    }
  };

  const confirmSave = async () => {
    if (!selectedOrgs?.length && !allOrgs) {
      openConfirmModal();
    } else {
      await saveOrgs();
    }
  };

  useEffect(() => {
    if (taxonomy) {
      if (selectedOrgs === null) {
        setSelectedOrgs([...taxonomy.orgs]);
      }
      if (allOrgs === null) {
        setAllOrgs(taxonomy.allOrgs);
      }
    }
  }, [taxonomy, selectedOrgs, allOrgs]);

  useEffect(() => {
    if (selectedOrgs) {
      // This is a hack to force the Form.Autosuggest to clear its value after a selection is made.
      const inputRef = document.querySelector('.manage-orgs .pgn__form-group input') as HTMLInputElement | null;
      if (inputRef) {
        inputRef.value = '';
        const event = new Event('change', { bubbles: true });
        inputRef.dispatchEvent(event);
      }
    }
  }, [selectedOrgs]);

  if (!selectedOrgs || !taxonomy) {
    return null;
  }

  return (
    <Container onClick={(e) => e.stopPropagation() /* This prevents calling onClick handler from the parent */}>
      <ModalDialog
        className="manage-orgs"
        title={intl.formatMessage(messages.headerTitle)}
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        hasCloseButton
        isFullscreenOnMobile
        isOverflowVisible
      >
        {isDialogDisabled && (
          // This div is used to prevent the user from interacting with the dialog while it is disabled
          <div className="position-absolute w-100 h-100 d-block zindex-9" />
        )}

        <ModalDialog.Header>
          <ModalDialog.Title>
            {intl.formatMessage(messages.headerTitle)}
          </ModalDialog.Title>
        </ModalDialog.Header>

        <hr className="mx-4" />

        <ModalDialog.Body>
          <Form.Group>
            <Stack>
              <div className="pb-5">{intl.formatMessage(messages.bodyText)}</div>
              <Form.Label>
                <div>{intl.formatMessage(messages.currentAssignments)}</div>
              </Form.Label>
              <div className="col-9 d-inline-box overflow-auto">
                {selectedOrgs.length ? selectedOrgs.map((org) => (
                  <Chip
                    key={org}
                    iconAfter={Close}
                    iconAfterAlt={intl.formatMessage(messages.removeOrg, { org })}
                    onIconAfterClick={() => setSelectedOrgs(selOrgs => (selOrgs || []).filter((o) => o !== org))}
                    disabled={!!allOrgs}
                  >
                    {org}
                  </Chip>
                )) : <span className="text-muted">{intl.formatMessage(messages.noOrganizationAssigned)}</span> }
              </div>
            </Stack>
          </Form.Group>
          <Form.Group>
            <Form.Label>
              {intl.formatMessage(messages.addOrganizations)}
            </Form.Label>
            <Form.Autosuggest
              placeholder={intl.formatMessage(messages.searchOrganizations)}
              onChange={({ selectionValue }: { selectionValue: string }) => {
                if (selectionValue) {
                  setSelectedOrgs([...selectedOrgs, selectionValue]);
                }
              }}
              disabled={allOrgs}
            >
              {organizationListData ? organizationListData.filter(o => !selectedOrgs?.includes(o)).map((org) => (
                <Form.AutosuggestOption key={org}>{org}</Form.AutosuggestOption>
              )) : [] }
            </Form.Autosuggest>
          </Form.Group>
          <Form.Checkbox
            checked={allOrgs}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllOrgs(e.target.checked)}
          >
            {intl.formatMessage(messages.assignAll)}
          </Form.Checkbox>
        </ModalDialog.Body>

        <hr className="mx-4" />

        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton onClick={onClose} variant="tertiary">
              {intl.formatMessage(messages.cancelButton)}
            </ModalDialog.CloseButton>
            <Button variant="primary" onClick={confirmSave}>
              {intl.formatMessage(messages.saveButton)}
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        confirm={saveOrgs}
        taxonomyName={taxonomy.name}
      />
    </Container>
  );
};

export default ManageOrgsModal;

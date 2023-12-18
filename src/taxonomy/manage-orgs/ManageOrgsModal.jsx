// @ts-check
import React, { useEffect, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Chip,
  Container,
  Form,
  ModalDialog,
  Stack,
} from '@edx/paragon';
import {
  Close,
} from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import { useOrganizationListData } from '../../generic/data/apiHooks';
import { useTaxonomyDetailDataResponse } from '../data/apiHooks';
import { useManageOrgs } from './data/api';
import messages from './messages';
import './ManageOrgsModal.scss';

const ManageOrgsModal = ({
  taxonomyId,
  isOpen,
  onClose,
}) => {
  const intl = useIntl();
  const [selectedOrgs, setSelectedOrgs] = useState(/** @type {null|string[]} */(null));
  const [allOrgs, setAllOrgs] = useState(/** @type {null|boolean} */(null));

  const {
    data: organizationListData,
  } = useOrganizationListData();

  const taxonomy = useTaxonomyDetailDataResponse(taxonomyId);

  const manageOrgMutation = useManageOrgs();

  const saveOrgs = async () => {
    if (selectedOrgs !== null && allOrgs !== null) {
      try {
        await manageOrgMutation.mutateAsync({
          taxonomyId,
          orgs: selectedOrgs,
          allOrgs,
        });
        // ToDo: display a success message to the user
      } catch (/** @type {any} */ error) {
        // ToDo: display the error to the user
      } finally {
        onClose();
      }
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
  }, [taxonomy]);

  useEffect(() => {
    if (selectedOrgs) {
      // This is a hack to force the Form.Autosuggest to clear its value after a selection is made.
      const inputRef = /** @type {null|HTMLInputElement} */ (document.querySelector('.pgn__form-group input'));
      if (inputRef) {
        inputRef.value = null;
        const event = new Event('change', { bubbles: true });
        inputRef.dispatchEvent(event);
      }
    }
  }, [selectedOrgs]);

  if (!selectedOrgs) {
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
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            {intl.formatMessage(messages.headerTitle)}
          </ModalDialog.Title>
        </ModalDialog.Header>

        <hr className="mx-4" />

        <ModalDialog.Body>
          <Form.Label>
            <Stack>
              <div>{intl.formatMessage(messages.bodyText)}</div>
              <div>{intl.formatMessage(messages.currentAssignments)}</div>
              <div className="col-9 d-inline-box overflow-auto">
                {selectedOrgs.length ? selectedOrgs.map((org) => (
                  <Chip
                    key={org}
                    iconAfter={Close}
                    onIconAfterClick={() => setSelectedOrgs(selectedOrgs.filter((o) => o !== org))}
                  >
                    {org}
                  </Chip>
                )) : <span className="text-muted">{intl.formatMessage(messages.noOrganizationAssigned)}</span> }
              </div>
            </Stack>
          </Form.Label>
          <Form.Group>
            <Form.Label>
              {intl.formatMessage(messages.addOrganizations)}
            </Form.Label>
            <Form.Autosuggest
              loading={!organizationListData}
              placeholder={intl.formatMessage(messages.searchOrganizations)}
              onSelected={(org) => setSelectedOrgs([...selectedOrgs, org])}
            >
              {organizationListData.filter(o => !selectedOrgs?.includes(o)).map((org) => (
                <Form.AutosuggestOption key={org}>{org}</Form.AutosuggestOption>
              ))}
            </Form.Autosuggest>
          </Form.Group>
          <Form.Checkbox checked={allOrgs} onChange={(e) => setAllOrgs(e.target.checked)}>
            {intl.formatMessage(messages.assignAll)}
          </Form.Checkbox>
        </ModalDialog.Body>

        <hr className="mx-4" />

        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              {intl.formatMessage(messages.cancelButton)}
            </ModalDialog.CloseButton>
            <Button
              variant="primary"
              onClick={saveOrgs}
              data-testid="save-button"
            >
              {intl.formatMessage(messages.saveButton)}
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </Container>
  );
};

ManageOrgsModal.propTypes = {
  taxonomyId: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ManageOrgsModal;

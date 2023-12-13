// @ts-check
import React, { useEffect, useRef, useState } from 'react';
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
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { useTaxonomyDetailDataResponse } from '../taxonomy-detail';

const ManageOrgsModal = ({
  taxonomyId,
  isOpen,
  onClose,
}) => {
  const intl = useIntl();
  const [allOrgs, setAllOrgs] = useState(/** @type {null|string[]} */(null));
  const [selectedOrgs, setSelectedOrgs] = useState(/** @type {null|string[]} */(null));

  const taxonomy = useTaxonomyDetailDataResponse(taxonomyId);

  useEffect(() => {
    if (!allOrgs) {
      setAllOrgs(Array.from(Array(100).keys()).map((i) => `org${i + 1}`));
    }
  }, []);

  useEffect(() => {
    if (taxonomy && !selectedOrgs) {
      setSelectedOrgs([...taxonomy.orgs]);
    }
  }, [taxonomy]);

  if (!allOrgs || !selectedOrgs) {
    return null;
  }

  return (
    <Container onClick={(e) => e.stopPropagation() /* This prevents calling onClick handler from the parent */}>
      <ModalDialog
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

        <ModalDialog.Body className="pb-5 mt-2">
          <Form.Group>
            <Form.Label>
              <Stack>
                <div>{intl.formatMessage(messages.bodyText)}</div>
                <div>{intl.formatMessage(messages.currentAssignments)}</div>
                <div className="col-9 d-inline-box overflow-auto">
                  {selectedOrgs && selectedOrgs.map((org) => (
                    <Chip
                      key={org}
                      iconAfter={Close}
                      onIconAfterClick={() => setSelectedOrgs(selectedOrgs.filter((o) => o !== org))}
                    >
                      {org}
                    </Chip>
                  ))}
                </div>
              </Stack>
            </Form.Label>
            <Form.Autosuggest
              loading={!allOrgs}
              placeholder="Search for an organization"
              aria-label="form autosuggest"
              errorMessageText="Error, no selected value"
              onSelected={(org) => setSelectedOrgs([...selectedOrgs, org])}
            >
              {allOrgs.filter(o => !selectedOrgs?.includes(o)).map((org) => (
                <Form.AutosuggestOption key={org}>{org}</Form.AutosuggestOption>
              ))}
            </Form.Autosuggest>
          </Form.Group>
        </ModalDialog.Body>

        <hr className="mx-4" />

        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              {intl.formatMessage(messages.cancelButton)}
            </ModalDialog.CloseButton>
            <Button
              variant="primary"
              // onClick={onClickExport}
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

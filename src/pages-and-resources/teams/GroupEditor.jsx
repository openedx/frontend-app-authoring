import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Form, TransitionReplace,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { GroupTypes, TeamSizes } from '../../data/constants';

import CollapsableEditor from '../../generic/CollapsableEditor';
import FormikErrorFeedback from '../../generic/FormikErrorFeedback';
import messages from './messages';

// Maps a team type to its corresponding intl message
const TeamTypeNameMessage = {
  [GroupTypes.OPEN]: {
    label: messages.groupTypeOpen,
    description: messages.groupTypeOpenDescription,
  },
  [GroupTypes.PUBLIC_MANAGED]: {
    label: messages.groupTypePublicManaged,
    description: messages.groupTypePublicManagedDescription,
  },
  [GroupTypes.PRIVATE_MANAGED]: {
    label: messages.groupTypePrivateManaged,
    description: messages.groupTypePrivateManagedDescription,
  },
};

function GroupEditor({
  intl, group, onDelete, onChange, onBlur, fieldNameCommonBase, errors, setFieldError,
}) {
  const [isDeleting, setDeleting] = useState(false);
  const [isOpen, setOpen] = useState(group.id === null);
  const initiateDeletion = () => setDeleting(true);
  const cancelDeletion = () => setDeleting(false);

  const handleToggle = (open) => setOpen(Boolean(errors.name || errors.maxTeamSize || errors.description) || open);
  const handleFocus = (e) => setFieldError(e.target.name, undefined);

  const formGroupClasses = 'mb-4 mx-2';

  return (
    <TransitionReplace>
      {isDeleting
        ? (
          <div className="d-flex flex-column card rounded mb-3 px-3 py-2 p-4" key="isDeleting">
            <h3>{intl.formatMessage(messages.groupDeleteHeading)}</h3>
            <p>{intl.formatMessage(messages.groupDeleteBody)}</p>
            <div className="d-flex flex-row justify-content-end">
              <Button variant="muted" size="sm" onClick={cancelDeletion}>
                {intl.formatMessage(messages.cancel)}
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => onDelete(group)}>
                {intl.formatMessage(messages.delete)}
              </Button>
            </div>
          </div>
        )
        : (
          <CollapsableEditor
            // If there is no id, this is a new team, so automatically open it
            key="isConfiguring"
            open={isOpen}
            onToggle={handleToggle}
            onDelete={initiateDeletion}
            deleteAlt={intl.formatMessage(messages.deleteAlt)}
            expandAlt={intl.formatMessage(messages.expandAlt)}
            collapseAlt={intl.formatMessage(messages.collapseAlt)}
            title={
              isOpen
                ? (
                  <div className="d-flex flex-column flex-shrink-1 h4 p-0 m-0">
                    {intl.formatMessage(messages.configureGroup)}
                  </div>
                ) : (
                  <div className="d-flex flex-column flex-shrink-1 small">
                    <span className="small text-gray-500">{intl.formatMessage(TeamTypeNameMessage[group.type].label)}</span>
                    <span className="text-truncate text-black">{group.name || '<new>'}</span>
                    <span className="small text-muted text-gray-500">{group.description || '<new>'}</span>
                  </div>
                )
            }
          >
            <Form.Group className={`${formGroupClasses} mt-2.5`}>
              <Form.Control
                className="pb-2"
                name={`${fieldNameCommonBase}.name`}
                floatingLabel={intl.formatMessage(messages.groupFormNameLabel)}
                defaultValue={group.name}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={handleFocus}
              />
              <FormikErrorFeedback name={`${fieldNameCommonBase}.name`}>
                <Form.Text>{intl.formatMessage(messages.groupFormNameHelp)}</Form.Text>
              </FormikErrorFeedback>
            </Form.Group>
            <Form.Group className={formGroupClasses}>
              <Form.Control
                className="pb-2"
                as="textarea"
                rows={4}
                name={`${fieldNameCommonBase}.description`}
                floatingLabel={intl.formatMessage(messages.groupFormDescriptionLabel)}
                defaultValue={group.description}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={handleFocus}
              />
              <FormikErrorFeedback name={`${fieldNameCommonBase}.description`}>
                <Form.Text>{intl.formatMessage(messages.groupFormDescriptionHelp)}</Form.Text>
              </FormikErrorFeedback>
            </Form.Group>
            <Form.Group className={formGroupClasses}>
              <Form.Label className="h4 my-3">
                {intl.formatMessage(messages.groupFormTypeLabel)}
              </Form.Label>
              <Form.RadioSet
                name={`${fieldNameCommonBase}.type`}
                value={group.type}
                onChange={onChange}
                onBlur={onBlur}
              >
                {Object.values(GroupTypes).map(groupType => (
                  <Form.Radio
                    key={groupType}
                    value={groupType}
                    description={intl.formatMessage(TeamTypeNameMessage[groupType].description)}
                    className="my-2"
                    // TODO: This should probably be fixed on the paragon side
                    style={{ minWidth: '1.25rem', minHeight: '1.25rem' }}
                  >
                    {intl.formatMessage(TeamTypeNameMessage[groupType].label)}
                  </Form.Radio>
                ))}
              </Form.RadioSet>
            </Form.Group>
            <Form.Group className="mx-2">
              <Form.Label className="h4 pb-4">{intl.formatMessage(messages.teamSize)}</Form.Label>
              <Form.Control
                type="number"
                name={`${fieldNameCommonBase}.maxTeamSize`}
                floatingLabel={intl.formatMessage(messages.groupFormMaxSizeLabel)}
                value={group.maxTeamSize}
                placeholder={TeamSizes.DEFAULT}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={handleFocus}
              />
              <FormikErrorFeedback name={`${fieldNameCommonBase}.maxTeamSize`}>
                <Form.Text>{intl.formatMessage(messages.groupFormMaxSizeHelp)}</Form.Text>
              </FormikErrorFeedback>
            </Form.Group>
          </CollapsableEditor>
        )}
    </TransitionReplace>
  );
}

export const groupShape = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  maxTeamSize: PropTypes.number.isRequired,
});

GroupEditor.propTypes = {
  intl: intlShape.isRequired,
  fieldNameCommonBase: PropTypes.string.isRequired,
  errors: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    maxTeamSize: PropTypes.string,
  }),
  group: groupShape.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  setFieldError: PropTypes.func.isRequired,
};

GroupEditor.defaultProps = {
  errors: {
    name: null,
    description: null,
    maxTeamSize: null,
  },
};

export default injectIntl(GroupEditor);

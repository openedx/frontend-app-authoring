import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Form, TransitionReplace } from '@edx/paragon';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { TeamSetTypes } from '../../data/constants';

import CollapsableEditor from '../../generic/CollapsableEditor';
import FormikErrorFeedback from '../../generic/FormikErrorFeedback';
import messages from './messages';

// Maps a team type to its corresponding intl message
const TeamTypeNameMessage = {
  [TeamSetTypes.OPEN]: {
    label: messages.teamSetTypeOpen,
    description: messages.teamSetTypeOpenDescription,
  },
  [TeamSetTypes.PUBLIC_MANAGED]: {
    label: messages.teamSetTypePublicManaged,
    description: messages.teamSetTypePublicManagedDescription,
  },
  [TeamSetTypes.PRIVATE_MANAGED]: {
    label: messages.teamSetTypePrivateManaged,
    description: messages.teamSetTypePrivateManagedDescription,
  },
};

function TeamSetEditor({
  intl, teamSet, onDelete, onChange, onBlur, fieldNameCommonBase, errors,
}) {
  const [isDeleting, setDeleting] = useState(false);
  const [isOpen, setOpen] = useState(teamSet.id === null);
  const initiateDeletion = () => setDeleting(true);
  const cancelDeletion = () => setDeleting(false);

  const handleToggle = (open) => setOpen(Boolean(errors.name || errors.maxTeamSize || errors.description) || open);

  const formGroupClasses = 'mb-4';

  return (
    <TransitionReplace>
      {isDeleting
        ? (
          <div className="d-flex flex-column card rounded mb-3 px-3 py-2 p-4" key="isDeleting">
            <h3>{intl.formatMessage(messages.teamSetDeleteHeading)}</h3>
            <p>{intl.formatMessage(messages.teamSetDeleteBody)}</p>
            <div className="d-flex flex-row justify-content-end">
              <Button variant="muted" size="sm" onClick={cancelDeletion}>
                {intl.formatMessage(messages.cancel)}
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => onDelete(teamSet)}>
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
                    {intl.formatMessage(messages.configureTeamSet)}
                  </div>
                ) : (
                  <div className="d-flex flex-column small flex-shrink-1">
                    <span>{intl.formatMessage(TeamTypeNameMessage[teamSet.type].label)}</span>
                    <span className="h4 text-truncate">{teamSet.name || '<new>'}</span>
                    <span className="text-truncate">{teamSet.description || '<new>'}</span>
                  </div>
                )
            }
          >
            <Form.Group className={`${formGroupClasses} mt-2.5`}>
              <Form.Control
                name={`${fieldNameCommonBase}.name`}
                floatingLabel={intl.formatMessage(messages.teamSetFormNameLabel)}
                defaultValue={teamSet.name}
                onChange={onChange}
                onBlur={onBlur}
              />
              <Form.Text>{intl.formatMessage(messages.teamSetFormNameHelp)}</Form.Text>
              <FormikErrorFeedback name={`${fieldNameCommonBase}.name`} />
            </Form.Group>
            <Form.Group className={formGroupClasses}>
              <Form.Control
                name={`${fieldNameCommonBase}.description`}
                floatingLabel={intl.formatMessage(messages.teamSetFormDescriptionLabel)}
                defaultValue={teamSet.description}
                onChange={onChange}
                onBlur={onBlur}
              />
              <Form.Text>{intl.formatMessage(messages.teamSetFormDescriptionHelp)}</Form.Text>
              <FormikErrorFeedback name={`${fieldNameCommonBase}.description`} />
            </Form.Group>
            <Form.Group className={formGroupClasses}>
              <Form.Label className="h4 my-3">
                {intl.formatMessage(messages.teamSetFormTypeLabel)}
              </Form.Label>
              <Form.RadioSet
                name={`${fieldNameCommonBase}.type`}
                value={teamSet.type}
                onChange={onChange}
                onBlur={onBlur}
              >
                {Object.values(TeamSetTypes).map(teamSetType => (
                  <Form.Radio
                    key={teamSetType}
                    value={teamSetType}
                    description={intl.formatMessage(TeamTypeNameMessage[teamSetType].description)}
                    className="my-2"
                  >
                    {intl.formatMessage(TeamTypeNameMessage[teamSetType].label)}
                  </Form.Radio>
                ))}
              </Form.RadioSet>
            </Form.Group>
            <Form.Group>
              <Form.Label className="h4 pb-4">{intl.formatMessage(messages.teamSize)}</Form.Label>
              <Form.Control
                type="number"
                name={`${fieldNameCommonBase}.maxTeamSize`}
                floatingLabel={intl.formatMessage(messages.teamSetFormMaxSizeLabel)}
                defaultValue={teamSet.maxTeamSize}
                onChange={onChange}
                onBlur={onBlur}
              />
              <Form.Text>{intl.formatMessage(messages.teamSetFormMaxSizeHelp)}</Form.Text>
              <FormikErrorFeedback name={`${fieldNameCommonBase}.maxTeamSize`} />
            </Form.Group>
          </CollapsableEditor>
        )}
    </TransitionReplace>
  );
}

export const teamSetShape = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  maxTeamSize: PropTypes.number.isRequired,
});

TeamSetEditor.propTypes = {
  intl: intlShape.isRequired,
  fieldNameCommonBase: PropTypes.string.isRequired,
  errors: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    maxTeamSize: PropTypes.string,
  }),
  teamSet: teamSetShape.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
};

TeamSetEditor.defaultProps = {
  errors: {
    name: null,
    description: null,
    maxTeamSize: null,
  },
};

export default injectIntl(TeamSetEditor);

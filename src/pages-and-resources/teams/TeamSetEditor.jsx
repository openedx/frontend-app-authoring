import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import {
  Button, Collapsible, Form, TransitionReplace,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import messages from './messages';

/**
 * Team sizes enum
 * @enum
 * @type {{MIN: number, MAX: number, DEFAULT: number}}
 */
export const TeamSizes = {
  DEFAULT: 50,
  MIN: 1,
  MAX: 500,
};

/**
 * Team types enum
 * @enum
 * @type {{PRIVATE_MANAGED: string, PUBLIC_MANAGED: string, OPEN: string}}
 */
export const TeamSetTypes = {
  OPEN: 'open',
  PUBLIC_MANAGED: 'public_managed',
  PRIVATE_MANAGED: 'private_managed',
};

// Maps a team type to its corresponding intl message
const TeamTypeNameMessage = {
  [TeamSetTypes.OPEN]: messages.teamSetTypeOpen,
  [TeamSetTypes.PUBLIC_MANAGED]: messages.teamSetTypePublicManaged,
  [TeamSetTypes.PRIVATE_MANAGED]: messages.teamSetTypePrivateManaged,
};

function TeamSetEditor({
  intl, teamSet, onDelete, onChange, onBlur, fieldNameCommonBase, errors, touched,
}) {
  const [isDeleting, setDeleting] = useState(false);
  const initiateDeletion = () => setDeleting(true);
  const cancelDeletion = () => setDeleting(false);

  return (
    <Collapsible
      title={(
        <div className="d-flex flex-column small flex-shrink-1">
          <span>{intl.formatMessage(TeamTypeNameMessage[teamSet.type])}</span>
          <span className="h4 text-truncate">{teamSet.name || '<new>'}</span>
          <span className="text-truncate">{teamSet.description || '<new>'}</span>
        </div>
      )}
      // If there is no id, this is a new team, so automatically open it
      defaultOpen={teamSet.id === null}
    >
      <TransitionReplace>
        {isDeleting
          ? (
            <div className="d-flex flex-column m-4" key="isDeleting">
              <h3>{intl.formatMessage(messages.teamSetDeleteHeading)}</h3>
              <p>{intl.formatMessage(messages.teamSetDeleteBody)}</p>
              <div className="d-flex flex-row justify-content-end">
                <Button variant="muted" size="sm" onClick={() => onDelete(teamSet)}>
                  {intl.formatMessage(messages.delete)}
                </Button>
                <Button variant="muted" size="sm" onClick={cancelDeletion}>
                  {intl.formatMessage(messages.cancel)}
                </Button>
              </div>
            </div>
          )
          : (
            <React.Fragment key="isConfiguring">
              <Form.Group key="isConfiguring">
                <Form.Control
                  name={`${fieldNameCommonBase}.name`}
                  floatingLabel={intl.formatMessage(messages.teamSetFormNameLabel)}
                  defaultValue={teamSet.name}
                  onChange={onChange}
                  onBlur={onBlur}
                />
                <Form.Text>{intl.formatMessage(messages.teamSetFormNameHelp)}</Form.Text>
                {(touched?.name && errors?.name) && (
                <Form.Control.Feedback type="invalid" hasIcon={false}>
                  {intl.formatMessage(messages.teamSetFormNameError)}
                </Form.Control.Feedback>
                )}
              </Form.Group>
              <Form.Group>
                <Form.Control
                  name={`${fieldNameCommonBase}.description`}
                  floatingLabel={intl.formatMessage(messages.teamSetFormDescriptionLabel)}
                  defaultValue={teamSet.description}
                  onChange={onChange}
                  onBlur={onBlur}
                />
                <Form.Text>{intl.formatMessage(messages.teamSetFormDescriptionHelp)}</Form.Text>
                {(touched?.description && errors?.description) && (
                <Form.Control.Feedback type="invalid" hasIcon={false}>
                  {intl.formatMessage(messages.teamSetFormDescriptionError)}
                </Form.Control.Feedback>
                )}
              </Form.Group>
              <Form.Group>
                <Form.Control
                  as="select"
                  name={`${fieldNameCommonBase}.type`}
                  floatingLabel={intl.formatMessage(messages.teamSetFormTypeLabel)}
                  defaultValue={teamSet.type}
                  onChange={onChange}
                  onBlur={onBlur}
                >
                  {Object.values(TeamSetTypes).map(teamSetType => (
                    <option value={teamSetType} key={teamSetType}>
                      {intl.formatMessage(TeamTypeNameMessage[teamSetType])}
                    </option>
                  ))}
                </Form.Control>
                <Form.Text>{intl.formatMessage(messages.teamSetFormTypeHelp)}</Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Control
                  type="number"
                  name={`${fieldNameCommonBase}.maxTeamSize`}
                  floatingLabel={intl.formatMessage(messages.teamSetFormMaxSizeLabel)}
                  defaultValue={teamSet.maxTeamSize}
                  onChange={onChange}
                  onBlur={onBlur}
                />
                <Form.Text>{intl.formatMessage(messages.teamSetFormMaxSizeHelp)}</Form.Text>
                {(touched?.maxTeamSize && errors?.maxTeamSize) && (
                <Form.Control.Feedback type="invalid" hasIcon={false}>
                  {intl.formatMessage(messages.teamSetFormMaxSizeError, {
                    min: TeamSizes.MIN,
                    max: TeamSizes.MAX,
                  })}
                </Form.Control.Feedback>
                )}
              </Form.Group>
              <hr style={{ marginLeft: '-0.75rem', marginRight: '-0.5rem' }} />
              <Button variant="muted" className="p-0" onClick={initiateDeletion}>
                {intl.formatMessage(messages.delete)}
              </Button>
            </React.Fragment>
          )}
      </TransitionReplace>
    </Collapsible>
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
  touched: PropTypes.shape({
    name: PropTypes.bool,
    description: PropTypes.bool,
    maxTeamSize: PropTypes.bool,
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
  touched: {
    name: false,
    description: false,
    maxTeamSize: false,
  },
};

export default injectIntl(TeamSetEditor);

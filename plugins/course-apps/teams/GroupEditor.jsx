import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Form, TransitionReplace } from '@openedx/paragon';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { GroupTypes, TeamSizes } from 'CourseAuthoring/data/constants';

import CollapsableEditor from 'CourseAuthoring/generic/CollapsableEditor';
import FormikControl from 'CourseAuthoring/generic/FormikControl';
import messages from './messages';
import { isGroupTypeEnabled } from './utils';

// Maps a team type to its corresponding intl message
const TeamTypeNameMessage = {
  [GroupTypes.OPEN]: {
    label: messages.groupTypeOpen,
    description: messages.groupTypeOpenDescription,
  },
  [GroupTypes.OPEN_MANAGED]: {
    label: messages.groupTypeOpenManaged,
    description: messages.groupTypeOpenManagedDescription,
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

const GroupEditor = ({
  intl, group, onDelete, onChange, onBlur, fieldNameCommonBase, errors,
}) => {
  const [isDeleting, setDeleting] = useState(false);
  const [isOpen, setOpen] = useState(group.id === null);
  const initiateDeletion = () => setDeleting(true);
  const cancelDeletion = () => setDeleting(false);

  const handleToggle = (open) => setOpen(Boolean(errors.name || errors.maxTeamSize || errors.description) || open);

  const formGroupClasses = 'mb-4 mx-2';

  return (
    <TransitionReplace>
      {isDeleting
        ? (
          <div className="d-flex flex-column card rounded mb-3 px-4 py-2 p-4" key="isDeleting">
            <h4 className="mb-3">{intl.formatMessage(messages.groupDeleteHeading)}</h4>
            {intl.formatMessage(messages.groupDeleteBody).split('\n').map(text => <p>{text}</p>)}
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
                  <div className="d-flex flex-column flex-shrink-1 small mw-100">
                    <div className="small text-gray-500">{intl.formatMessage(TeamTypeNameMessage[group.type ? group.type : GroupTypes.OPEN].label)} </div>
                    <div className="h4 text-truncate my-1 font-weight-normal">{group.name}</div>
                    <div className="small text-truncate text-muted text-gray-500">{group.description}</div>
                  </div>
                )
            }
          >
            <FormikControl
              name={`${fieldNameCommonBase}.name`}
              value={group.name}
              floatingLabel={intl.formatMessage(messages.groupFormNameLabel)}
              help={intl.formatMessage(messages.groupFormNameHelp)}
              className={`${formGroupClasses} mt-2.5`}
            />
            <FormikControl
              name={`${fieldNameCommonBase}.description`}
              value={group.description}
              floatingLabel={intl.formatMessage(messages.groupFormDescriptionLabel)}
              help={intl.formatMessage(messages.groupFormDescriptionHelp)}
              as="textarea"
              rows={4}
              style={{ minHeight: '2.5rem' }}
              className={formGroupClasses}
            />
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
                {Object.values(GroupTypes).map(groupType => isGroupTypeEnabled(groupType) && (
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
            <FormikControl
              type="number"
              name={`${fieldNameCommonBase}.maxTeamSize`}
              floatingLabel={intl.formatMessage(messages.groupFormMaxSizeLabel)}
              value={group.maxTeamSize}
              help={intl.formatMessage(messages.groupFormMaxSizeHelp)}
              label={<Form.Label className="h4 pb-4">{intl.formatMessage(messages.teamSize)}</Form.Label>}
              className="mx-2"
              placeholder={TeamSizes.DEFAULT}
            />
          </CollapsableEditor>
        )}
    </TransitionReplace>
  );
};

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
};

GroupEditor.defaultProps = {
  errors: {
    name: null,
    description: null,
    maxTeamSize: null,
  },
};

export default injectIntl(GroupEditor);

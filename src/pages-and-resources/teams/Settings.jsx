import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Form } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';

import { FieldArray } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import { v4 as uuid } from 'uuid';
import * as Yup from 'yup';
import { GroupTypes, TeamSizes } from '../../data/constants';

import FormikErrorFeedback from '../../generic/FormikErrorFeedback';
import { setupYupExtensions, useAppSetting } from '../../utils';
import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import GroupEditor from './GroupEditor';
import messages from './messages';

setupYupExtensions();

function TeamSettings({
  intl,
  onClose,
}) {
  const [teamsConfiguration, saveSettings] = useAppSetting('teamsConfiguration');
  const blankNewGroup = {
    name: '',
    description: '',
    type: GroupTypes.OPEN,
    maxTeamSize: TeamSizes.DEFAULT,
    id: null,
    key: uuid(),
  };

  const handleSettingsSave = async (values) => {
    // For newly-added teams, fill in an id.
    const groups = values.groups?.map(group => ({
      id: group.id || uuid(),
      name: group.name,
      type: group.type,
      description: group.description,
      max_team_size: group.maxTeamSize,
    }));
    return saveSettings({ team_sets: groups, max_team_size: values.maxTeamSize });
  };

  return (
    <AppSettingsModal
      appId="teams"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableTeamsHelp)}
      enableAppLabel={intl.formatMessage(messages.enableTeamsLabel)}
      learnMoreText={intl.formatMessage(messages.enableTeamsLink)}
      onClose={onClose}
      bodyClassName="bg-light-200"
      // Topic is supported for backwards compatibility, the new field is team_sets:
      // ref: https://github.com/edx/edx-platform/blob/15461d3b6e6c0a724a7b8ed09241d970f201e5e7/openedx/core/lib/teams_config.py#L104-L108
      initialValues={{
        maxTeamSize: teamsConfiguration?.maxTeamSize,
        groups: teamsConfiguration?.teamSets || teamsConfiguration?.topics,
      }}
      validationSchema={{
        maxTeamSize: Yup.number()
          .required(intl.formatMessage(messages.maxTeamSizeEmpty))
          .min(TeamSizes.MIN, intl.formatMessage(messages.maxTeamSizeInvalid))
          .max(
            TeamSizes.MAX,
            intl.formatMessage(messages.maxTeamSizeTooHigh, {
              max: TeamSizes.MAX,
            }),
          ),
        groups: Yup.array().of(
          Yup.object({
            id: Yup.string().nullable(),
            name: Yup.string()
              .required(intl.formatMessage(messages.groupFormNameEmpty))
              .trim(),
            type: Yup.string().oneOf(Object.values(GroupTypes)),
            description: Yup.string()
              .required(intl.formatMessage(messages.groupFormDescriptionError))
              .trim(),
            maxTeamSize: Yup.number()
              .nullable()
              .min(TeamSizes.MIN, intl.formatMessage(messages.maxTeamSizeInvalid))
              .max(
                TeamSizes.MAX,
                intl.formatMessage(messages.maxTeamSizeTooHigh, {
                  max: TeamSizes.MAX,
                }),
              )
              .default(null),
          }),
        )
          .default([])
          .uniqueProperty('name', intl.formatMessage(messages.groupFormNameExists)),
      }}
      onSettingsSave={handleSettingsSave}
      configureBeforeEnable
    >
      {
        ({
          handleChange, handleBlur, values, errors, setFieldError,
        }) => (
          <>
            <h4 className="my-3 pb-2">{intl.formatMessage(messages.teamSize)}</h4>
            <Form.Group className="pb-1">
              <Form.Control
                className="pb-2"
                type="number"
                name="maxTeamSize"
                floatingLabel={intl.formatMessage(messages.maxTeamSize)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.maxTeamSize}
                onFocus={(event) => setFieldError(event.target.name, undefined)}
              />
              <FormikErrorFeedback name="maxTeamSize">
                <Form.Text>{intl.formatMessage(messages.maxTeamSizeHelp)}</Form.Text>
              </FormikErrorFeedback>
            </Form.Group>
            <div className="bg-light-200 d-flex flex-column mx-n4 px-4 py-4 border border-top mb-n3.5">
              <h4 className="mb-4">{intl.formatMessage(messages.groups)}</h4>
              <FieldArray name="groups">
                {({ push, remove }) => (
                  <>
                    {values.groups?.map((group, index) => (
                      <GroupEditor
                        key={group.id || group.key}
                        group={group}
                        errors={errors.groups?.[index]}
                        fieldNameCommonBase={`groups.${index}`}
                        onDelete={() => remove(index)}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        setFieldError={setFieldError}
                      />
                    ))}
                    <Button
                      variant="plain"
                      className="p-0 align-self-start mt-3"
                      iconBefore={Add}
                      onClick={() => push(blankNewGroup)}
                    >
                      {intl.formatMessage(messages.addGroup)}
                    </Button>
                  </>
                )}
              </FieldArray>
            </div>
          </>
        )
      }
    </AppSettingsModal>
  );
}

TeamSettings.propTypes = {
  intl: intlShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default injectIntl(TeamSettings);

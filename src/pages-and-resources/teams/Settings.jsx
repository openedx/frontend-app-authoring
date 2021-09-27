import React from 'react';
import PropTypes from 'prop-types';

import { FieldArray } from 'formik';
import { v4 as uuid } from 'uuid';
import * as Yup from 'yup';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Form, Icon } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { TeamSetTypes, TeamSizes } from '../../data/constants';

import FormikErrorFeedback from '../../generic/FormikErrorFeedback';
import { setupYupExtensions, useAppSetting } from '../../utils';
import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import messages from './messages';
import TeamSetEditor from './TeamSetEditor';

setupYupExtensions();

function TeamSettings({
  intl,
  onClose,
}) {
  const [teamsConfiguration, saveSettings] = useAppSetting('teamsConfiguration');
  const blankNewTeamSet = {
    name: '',
    description: '',
    type: TeamSetTypes.OPEN,
    maxTeamSize: TeamSizes.DEFAULT,
    id: null,
    key: uuid(),
  };

  const handleSettingsSave = async (values) => {
    // For newly-added teams, fill in an id.
    const teamSets = values.teamSets?.map(teamSet => ({
      id: teamSet.id || uuid(),
      name: teamSet.name,
      type: teamSet.type,
      description: teamSet.description,
      max_team_size: teamSet.maxTeamSize,
    }));
    return saveSettings({ team_sets: teamSets, max_team_size: values.maxTeamSize });
  };

  return (
    <AppSettingsModal
      appId="teams"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableTeamsHelp)}
      configureAppHelp={intl.formatMessage(messages.configureTeamsHelp)}
      enableAppLabel={intl.formatMessage(messages.enableTeamsLabel)}
      learnMoreText={intl.formatMessage(messages.enableTeamsLink)}
      onClose={onClose}
      // Topic is supported for backwards compatibility, the new field is team_sets:
      // ref: https://github.com/edx/edx-platform/blob/15461d3b6e6c0a724a7b8ed09241d970f201e5e7/openedx/core/lib/teams_config.py#L104-L108
      initialValues={{
        maxTeamSize: teamsConfiguration?.maxTeamSize,
        teamSets: teamsConfiguration?.teamSets || teamsConfiguration?.topics,
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
        teamSets: Yup.array().of(
          Yup.object({
            id: Yup.string().nullable(),
            name: Yup.string()
              .required(intl.formatMessage(messages.teamSetFormNameEmpty))
              .trim(),
            type: Yup.string().oneOf(Object.values(TeamSetTypes)),
            description: Yup.string()
              .required(intl.formatMessage(messages.teamSetFormDescriptionError))
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
          .uniqueProperty('name', intl.formatMessage(messages.teamSetFormNameExists)),
      }}
      onSettingsSave={handleSettingsSave}
      configureBeforeEnable
    >
      {
        ({
          handleChange, handleBlur, values, errors,
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
              />
              <Form.Text>{intl.formatMessage(messages.maxTeamSizeHelp)}</Form.Text>
              <FormikErrorFeedback name="maxTeamSize" />
            </Form.Group>
            <div className="bg-light-200 d-flex flex-column mx-n4 px-4 py-4 border border-top">
              <h4 className="mb-4">{intl.formatMessage(messages.teamSets)}</h4>
              <FieldArray name="teamSets">
                {({ push, remove }) => (
                  <>
                    {values.teamSets?.map((teamSet, index) => (
                      <TeamSetEditor
                        key={teamSet.id || teamSet.key}
                        teamSet={teamSet}
                        errors={errors.teamSets?.[index]}
                        fieldNameCommonBase={`teamSets.${index}`}
                        onDelete={() => remove(index)}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    ))}
                    <Button
                      variant="plain"
                      className="p-0 align-self-start mt-3"
                      onClick={() => push(blankNewTeamSet)}
                    >
                      <Icon src={Add} /> {intl.formatMessage(messages.addTeamSet)}
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

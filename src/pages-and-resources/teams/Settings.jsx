import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { FieldArray } from 'formik';

import PropTypes from 'prop-types';
import React from 'react';
import { v4 as uuid } from 'uuid';
import * as Yup from 'yup';
import { useAppSetting } from '../../utils';
import AppSettingsModal from '../app-settings-modal/AppSettingsModal';
import messages from './messages';
import TeamSetEditor, { TeamSetTypes, TeamSizes } from './TeamSetEditor';

function TeamSettings({
  intl,
  onClose,
}) {
  const [teamsConfiguration, saveSettings] = useAppSetting('teamsConfiguration');
  const blankNewTopic = {
    name: '',
    description: '',
    type: 'open',
    maxTeamSize: TeamSizes.DEFAULT,
    id: null,
  };

  const handleSettingsSave = (values) => {
    // For newly-added teams, fill in an id.
    const topics = values.topics.map(topic => ({
      id: topic.id || uuid(),
      name: topic.name,
      type: topic.type,
      description: topic.description,
      max_team_size: topic.maxTeamSize,
    }));
    saveSettings({ topics });
  };

  return (
    <AppSettingsModal
      appId="teams"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableTeamsHelp)}
      enableAppLabel={intl.formatMessage(messages.enableTeamsLabel)}
      learnMoreText={intl.formatMessage(messages.enableTeamsLink)}
      onClose={onClose}
      initialValues={{ ...teamsConfiguration }}
      validationSchema={{
        topics: Yup.array().of(
          Yup.object({
            id: Yup.string(),
            name: Yup.string().required().trim(),
            type: Yup.mixed().oneOf(Object.values(TeamSetTypes)),
            description: Yup.string().required().trim(),
            maxTeamSize: Yup.number().required().min(TeamSizes.MIN).max(TeamSizes.MAX),
          }),
        ).default([]),
      }}
      onSettingsSave={handleSettingsSave}
      configureBeforeEnable
    >
      {
        ({
          handleChange, handleBlur, values, errors, touched,
        }) => (
          <>
            <h5>{intl.formatMessage(messages.teamSets)}</h5>
            <FieldArray name="topics">
              {({ push, remove }) => (
                <div>
                  {values.topics?.map((topic, index) => (
                    <TeamSetEditor
                      key={index}
                      teamSet={topic}
                      errors={errors.topics?.[index]}
                      touched={touched.topics?.[index]}
                      fieldNameCommonBase={`topics.${index}`}
                      onDelete={() => remove(index)}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  ))}
                  <Button
                    variant="plain"
                    onClick={() => push(blankNewTopic)}
                  >
                    <Icon src={Add} /> {intl.formatMessage(messages.addTeamSet)}
                  </Button>
                </div>
              )}
            </FieldArray>
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

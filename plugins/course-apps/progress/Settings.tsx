import { useIntl } from '@edx/frontend-platform/i18n';
import React from 'react';
import * as Yup from 'yup';
import { getConfig } from '@edx/frontend-platform';
import FormSwitchGroup from 'CourseAuthoring/generic/FormSwitchGroup';
import { useAppSetting } from 'CourseAuthoring/utils';
import AppSettingsModal from 'CourseAuthoring/pages-and-resources/app-settings-modal/AppSettingsModal';
import { useUpdateCourseAdvancedSettings } from 'CourseAuthoring/data/apiHooks';
import { useCourseAuthoringContext } from 'CourseAuthoring/CourseAuthoringContext';
import messages from './messages';

const ProgressSettings = ({ onClose }: { onClose: () => void; }) => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();
  const settingsName = 'disableProgressGraph';
  const disableProgressGraph = useAppSetting(settingsName);
  const updateCourseAdvancedSettingsMutation = useUpdateCourseAdvancedSettings(courseId);
  const showProgressGraphSetting = getConfig().ENABLE_PROGRESS_GRAPH_SETTINGS.toString().toLowerCase() === 'true';

  const handleSettingsSave = async (values) => {
    if (showProgressGraphSetting) {
      try {
        await updateCourseAdvancedSettingsMutation.mutateAsync({
          setting: settingsName,
          value: !values.enableProgressGraph,
        });
        return true;
      } catch {
        return false;
      }
    }
    return true;
  };

  return (
    <AppSettingsModal
      appId="progress"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableProgressHelp)}
      enableAppLabel={intl.formatMessage(messages.enableProgressLabel)}
      learnMoreText={intl.formatMessage(messages.enableProgressLink)}
      onClose={onClose}
      initialValues={{ enableProgressGraph: !disableProgressGraph }}
      validationSchema={{ enableProgressGraph: Yup.boolean() }}
      onSettingsSave={handleSettingsSave}
    >
      {({ handleChange, handleBlur, values }) => (
        showProgressGraphSetting && (
          <FormSwitchGroup
            id="enable-progress-graph"
            name="enableProgressGraph"
            label={intl.formatMessage(messages.enableGraphLabel)}
            helpText={intl.formatMessage(messages.enableGraphHelp)}
            onChange={handleChange}
            onBlur={handleBlur}
            checked={values.enableProgressGraph}
          />
        )
      )}
    </AppSettingsModal>
  );
};

export default ProgressSettings;

import { useIntl } from '@edx/frontend-platform/i18n';
import * as Yup from 'yup';

import { useCourseAuthoringContext } from 'CourseAuthoring/CourseAuthoringContext';
import FormSwitchGroup from 'CourseAuthoring/generic/FormSwitchGroup';
import { useAppSetting } from 'CourseAuthoring/utils';
import AppSettingsModal from 'CourseAuthoring/pages-and-resources/app-settings-modal/AppSettingsModal';
import { useUpdateCourseAdvancedSettings } from 'CourseAuthoring/data/apiHooks';
import messages from './messages';

const WikiSettings = ({ onClose }: { onClose: () => void }) => {
  const intl = useIntl();
  const settingName = 'allowPublicWikiAccess';
  const enablePublicWiki = useAppSetting(settingName);
  const { courseId } = useCourseAuthoringContext();

  const updateCourseAdvancedSettingsMutation = useUpdateCourseAdvancedSettings(courseId);
  const handleSettingsSave = async (values) => {
    try {
      await updateCourseAdvancedSettingsMutation.mutateAsync({
        setting: settingName,
        value: values.enablePublicWiki,
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppSettingsModal
      appId="wiki"
      title={intl.formatMessage(messages.heading)}
      enableAppHelp={intl.formatMessage(messages.enableWikiHelp)}
      enableAppLabel={intl.formatMessage(messages.enableWikiLabel)}
      learnMoreText={intl.formatMessage(messages.enableWikiLink)}
      onClose={onClose}
      initialValues={{ enablePublicWiki: !!enablePublicWiki }}
      validationSchema={{ enablePublicWiki: Yup.boolean() }}
      onSettingsSave={handleSettingsSave}
      enableReinitialize
    >
      {({ values, handleChange, handleBlur }) => (
        <FormSwitchGroup
          id="enable-public-wiki"
          name="enablePublicWiki"
          label={intl.formatMessage(messages.enablePublicWikiLabel)}
          helpText={intl.formatMessage(messages.enablePublicWikiHelp)}
          onChange={handleChange}
          onBlur={handleBlur}
          checked={values.enablePublicWiki}
        />
      )}
    </AppSettingsModal>
  );
};

export default WikiSettings;

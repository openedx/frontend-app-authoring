import { getConfig } from '@edx/frontend-platform';
import { initializeMocks } from '@src/testUtils';

import {
  getCourseAdvancedSettings,
  getCourseAdvancedSettingsApiUrl,
  updateCourseAdvancedSettings,
} from './api';

let axiosMock;
const courseId = 'course-v1:Test+T101+2024';

const showCalculator = {
  value: true,
  display_name: 'Show Calculator',
  help: 'Enter true or false. When true, students can see the calculator in the course.',
  deprecated: false,
  hide_on_enabled_publisher: false,
};

describe('Pages and resources advanced settings API', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('addresses the course advanced settings of authoring v1', () => {
    expect(getCourseAdvancedSettingsApiUrl(courseId)).toEqual(
      `${getConfig().STUDIO_BASE_URL}/api/authoring/v1/courses/${courseId}/advanced_settings/`,
    );
  });

  it('reads the named settings out of every setting of the course', async () => {
    axiosMock.onGet(getCourseAdvancedSettingsApiUrl(courseId)).reply(200, { show_calculator: showCalculator });

    const result = await getCourseAdvancedSettings(courseId, ['showCalculator', 'enableCcx']);

    expect(axiosMock.history.get[0].url).toEqual(getCourseAdvancedSettingsApiUrl(courseId));
    expect(axiosMock.history.get[0].params).toEqual({ view: 'full', fields: 'show_calculator,enable_ccx' });
    expect(result).toEqual({
      showCalculator: {
        value: true,
        displayName: 'Show Calculator',
        help: showCalculator.help,
        deprecated: false,
        hideOnEnabledPublisher: false,
      },
    });
  });

  it('sends the new value of one setting', async () => {
    axiosMock.onPatch(getCourseAdvancedSettingsApiUrl(courseId)).reply(200, {
      show_calculator: { ...showCalculator, value: false },
    });

    const result = await updateCourseAdvancedSettings(courseId, 'showCalculator', false);

    expect(axiosMock.history.patch[0].url).toEqual(getCourseAdvancedSettingsApiUrl(courseId));
    expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({ show_calculator: { value: false } });
    expect(result.showCalculator.value).toBe(false);
  });
});

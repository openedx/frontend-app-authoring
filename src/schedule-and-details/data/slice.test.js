import { reducer, updateCourseDetailsOverview } from './slice';

describe('scheduleAndDetails slice', () => {
  it('should update courseDetails.overview when updateCourseDetailsOverview is dispatched', () => {
    const prevState = {
      loadingDetailsStatus: 'IN_PROGRESS',
      loadingSettingsStatus: 'IN_PROGRESS',
      savingStatus: '',
      courseDetails: {
        title: 'Intro to Testing',
        overview: 'Old overview',
      },
      courseSettings: {},
    };

    const newOverview = '<p>New overview HTML content</p>';

    const nextState = reducer(prevState, updateCourseDetailsOverview(newOverview));

    expect(nextState.courseDetails.overview).toEqual(newOverview);
    expect(nextState.courseDetails.title).toEqual('Intro to Testing');
  });
});

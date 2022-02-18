import { locationId } from './data/constants/app';

import { actions } from './data/redux';
import thunkActions from './app';

jest.mock('./requests', () => ({
  initializeApp: (args) => ({ initializeApp: args }),
}));

describe('app thunkActions', () => {
  let dispatch;
  let dispatchedAction;
  beforeEach(() => {
    dispatch = jest.fn((action) => ({ dispatch: action }));
  });
  describe('initialize', () => {
    beforeEach(() => {
      thunkActions.initialize()(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches initializeApp with locationId and onSuccess', () => {
      expect(dispatchedAction.initializeApp.locationId).toEqual(locationId);
      expect(typeof dispatchedAction.initializeApp.onSuccess).toEqual('function');
    });
    describe('on success', () => {
      test('loads oraMetadata, courseMetadata and list data', () => {
        dispatch.mockClear();
        const response = {
          oraMetadata: { some: 'ora-metadata' },
          courseMetadata: { some: 'course-metadata' },
          submissions: { some: 'submissions' },
        };
        dispatchedAction.initializeApp.onSuccess(response);
        expect(dispatch.mock.calls).toEqual([
          [actions.app.loadOraMetadata(response.oraMetadata)],
          [actions.app.loadCourseMetadata(response.courseMetadata)],
          [actions.submissions.loadList(response.submissions)],
        ]);
      });
    });
  });
});

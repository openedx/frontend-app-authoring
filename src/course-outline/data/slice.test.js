import { configureStore } from '@reduxjs/toolkit';
import { reducer, fetchOutlineIndexSuccess } from './slice';

describe('course-outline slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        courseOutline: reducer,
      },
    });
  });

  describe('fetchOutlineIndexSuccess action', () => {
    it('sets enableTimedExams from payload', () => {
      const mockPayload = {
        courseStructure: {
          enableProctoredExams: true,
          enableTimedExams: false,
          childInfo: {
            children: [],
          },
        },
        isCustomRelativeDatesActive: false,
        createdOn: null,
      };

      store.dispatch(fetchOutlineIndexSuccess(mockPayload));

      const state = store.getState();
      expect(state.courseOutline.enableTimedExams).toBe(false);
      expect(state.courseOutline.enableProctoredExams).toBe(true);
    });

    it('sets enableTimedExams to true when provided', () => {
      const mockPayload = {
        courseStructure: {
          enableProctoredExams: false,
          enableTimedExams: true,
          childInfo: {
            children: [],
          },
        },
        isCustomRelativeDatesActive: false,
        createdOn: null,
      };

      store.dispatch(fetchOutlineIndexSuccess(mockPayload));

      const state = store.getState();
      expect(state.courseOutline.enableTimedExams).toBe(true);
    });

    it('handles missing enableTimedExams field gracefully', () => {
      const mockPayload = {
        courseStructure: {
          enableProctoredExams: true,
          childInfo: {
            children: [],
          },
        },
        isCustomRelativeDatesActive: false,
        createdOn: null,
      };

      store.dispatch(fetchOutlineIndexSuccess(mockPayload));

      const state = store.getState();
      expect(state.courseOutline.enableTimedExams).toBeUndefined();
      expect(state.courseOutline.enableProctoredExams).toBe(true);
    });

    it('initializes with enableTimedExams false by default', () => {
      const state = store.getState();
      expect(state.courseOutline.enableTimedExams).toBe(false);
    });
  });
});

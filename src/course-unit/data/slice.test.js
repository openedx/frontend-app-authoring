import { reducer, setXBlockPublishState } from './slice';

describe('setXBlockPublishState reducer', () => {
  it('sets published and hasChanges correctly when payload is true', () => {
    const prevState = {
      courseSectionVertical: {
        xblockInfo: {
          published: false,
          hasChanges: true,
        },
      },
    };
    const nextState = reducer(prevState, setXBlockPublishState(true));
    expect(nextState.courseSectionVertical.xblockInfo.published).toBe(true);
    expect(nextState.courseSectionVertical.xblockInfo.hasChanges).toBe(false);
  });

  it('sets published and hasChanges correctly when payload is false', () => {
    const prevState = {
      courseSectionVertical: {
        xblockInfo: {
          published: true,
          hasChanges: false,
        },
      },
    };
    const nextState = reducer(prevState, setXBlockPublishState(false));
    expect(nextState.courseSectionVertical.xblockInfo.published).toBe(false);
    expect(nextState.courseSectionVertical.xblockInfo.hasChanges).toBe(true);
  });
});

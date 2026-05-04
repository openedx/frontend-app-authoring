import { buildSelectionState } from './selection';

describe('buildSelectionState', () => {
  it('builds section selection state', () => {
    expect(buildSelectionState({
      currentId: 'section-1',
      sectionId: 'section-1',
      index: 2,
    })).toEqual({
      currentId: 'section-1',
      sectionId: 'section-1',
      subsectionId: undefined,
      index: 2,
    });
  });

  it('builds nested selection state', () => {
    expect(buildSelectionState({
      currentId: 'unit-1',
      sectionId: 'section-1',
      subsectionId: 'subsection-1',
    })).toEqual({
      currentId: 'unit-1',
      sectionId: 'section-1',
      subsectionId: 'subsection-1',
      index: undefined,
    });
  });
});

import { SelectionState } from '@src/data/types';
import { getBackSelectionState, openSelectionState } from './back-navigation';

describe('back-navigation', () => {
  const sections = [
    {
      id: 'section-1',
      childInfo: {
        children: [
          { id: 'subsection-1' },
          { id: 'subsection-2' },
        ],
      },
    },
  ] as any;

  describe('getBackSelectionState', () => {
    it('returns undefined when currentId missing', () => {
      expect(getBackSelectionState(undefined, sections)).toBeUndefined();
    });

    it('returns section selection when current is subsection', () => {
      const state: SelectionState = {
        currentId: 'subsection-1',
        subsectionId: 'subsection-1',
        sectionId: 'section-1',
      };

      expect(getBackSelectionState(state, sections)).toEqual({
        currentId: 'section-1',
        sectionId: 'section-1',
        index: 0,
      });
    });

    it('returns undefined when subsection has no section', () => {
      const state: SelectionState = {
        currentId: 'subsection-1',
        subsectionId: 'subsection-1',
      };

      expect(getBackSelectionState(state, sections)).toBeUndefined();
    });

    it('returns undefined when current is section', () => {
      const state: SelectionState = {
        currentId: 'section-1',
        sectionId: 'section-1',
      };

      expect(getBackSelectionState(state, sections)).toBeUndefined();
    });

    it('returns subsection selection when current is unit', () => {
      const state: SelectionState = {
        currentId: 'unit-1',
        subsectionId: 'subsection-2',
        sectionId: 'section-1',
      };

      expect(getBackSelectionState(state, sections)).toEqual({
        currentId: 'subsection-2',
        subsectionId: 'subsection-2',
        sectionId: 'section-1',
        index: 1,
      });
    });

    it('returns subsection selection with undefined index when section missing', () => {
      const state: SelectionState = {
        currentId: 'unit-1',
        subsectionId: 'subsection-2',
        sectionId: 'missing-section',
      };

      expect(getBackSelectionState(state, sections)).toEqual({
        currentId: 'subsection-2',
        subsectionId: 'subsection-2',
        sectionId: 'missing-section',
        index: undefined,
      });
    });

    it('uses selectedSection for index when sections list lacks children', () => {
      const state: SelectionState = {
        currentId: 'unit-1',
        subsectionId: 'subsection-2',
        sectionId: 'section-1',
      };

      const selectedSection = {
        id: 'section-1',
        childInfo: { children: [{ id: 'subsection-1' }, { id: 'subsection-2' }] },
      } as any;

      expect(getBackSelectionState(state, [{ id: 'section-1' }] as any, selectedSection)).toEqual({
        currentId: 'subsection-2',
        subsectionId: 'subsection-2',
        sectionId: 'section-1',
        index: 1,
      });
    });
  });

  describe('openSelectionState', () => {
    it('opens container with SelectionState payload', () => {
      const openContainer = jest.fn();

      openSelectionState(openContainer, {
        currentId: 'subsection-1',
        subsectionId: 'subsection-1',
        sectionId: 'section-1',
        index: 0,
      });

      expect(openContainer).toHaveBeenCalledWith('subsection-1', 'subsection-1', 'section-1', 0);
    });
  });
});

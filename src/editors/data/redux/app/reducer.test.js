import { initialState, actions, reducer } from './reducer';

const testingState = {
  ...initialState,
  arbitraryField: 'arbitrary',
};

describe('app reducer', () => {
  it('has initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  const testValue = 'roll for initiative';

  describe('handling actions', () => {
    describe('initialize', () => {
      it('loads initial input fields into the store', () => {
        const data = {
          studioEndpointUrl: 'testURL',
          lmsEndpointUrl: 'sOmEOtherTestuRl',
          blockId: 'anID',
          learningContextId: 'OTHERid',
          blockType: 'someTYPE',
        };
        expect(reducer(
          testingState,
          actions.initialize({ ...data, other: 'field' }),
        )).toEqual({
          ...testingState,
          ...data,
        });
      });
    });
    const setterTest = (action, target) => {
      describe(action, () => {
        it(`load ${target} from payload`, () => {
          expect(reducer(testingState, actions[action](testValue))).toEqual({
            ...testingState,
            [target]: testValue,
          });
        });
      });
    };
    [
      ['setUnitUrl', 'unitUrl'],
      ['setStudioView', 'studioView'],
      ['setBlockContent', 'blockContent'],
      ['setBlockId', 'blockId'],
      ['setBlockTitle', 'blockTitle'],
      ['setSaveResponse', 'saveResponse'],
      ['setVideos', 'videos'],
      ['setCourseDetails', 'courseDetails'],
    ].map(args => setterTest(...args));
    describe('setShowRawEditor', () => {
      it('sets showRawEditor', () => {
        const blockValue = { data: { metadata: { editor: 'raw' } } };
        expect(reducer(testingState, actions.setShowRawEditor(blockValue))).toEqual({
          ...testingState,
          showRawEditor: true,
        });
      });
    });
    describe('setBlockValue', () => {
      it('sets blockValue, as well as setting the blockTitle from data.display_name', () => {
        const blockValue = { data: { display_name: 'my test name' }, other: 'data' };
        expect(reducer(testingState, actions.setBlockValue(blockValue))).toEqual({
          ...testingState,
          blockValue,
          blockTitle: blockValue.data.display_name,
        });
      });
    });
    describe('setImages', () => {
      it('sets images, as well as setting imageCount', () => {
        const imageData = { images: { id1: { id: 'id1' } }, imageCount: 1 };
        expect(reducer(testingState, actions.setImages(imageData))).toEqual({
          ...testingState,
          images: imageData.images,
          imageCount: imageData.imageCount,
        });
      });
    });
    describe('initializeEditor', () => {
      it('sets editorInitialized to true', () => {
        expect(reducer(testingState, actions.initializeEditor())).toEqual({
          ...testingState,
          editorInitialized: true,
        });
      });
    });
  });
});

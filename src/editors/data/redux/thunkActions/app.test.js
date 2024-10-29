/* eslint-disable no-import-assign */
import { actions } from '..';
import { camelizeKeys } from '../../../utils';
import { RequestKeys } from '../../constants/requests';
import * as thunkActions from './app';

jest.mock('./requests', () => ({
  fetchBlock: (args) => ({ fetchBlock: args }),
  fetchUnit: (args) => ({ fetchUnit: args }),
  saveBlock: (args) => ({ saveBlock: args }),
  uploadAsset: (args) => ({ uploadAsset: args }),
  fetchStudioView: (args) => ({ fetchStudioView: args }),
  fetchImages: (args) => ({ fetchImages: args }),
  fetchVideos: (args) => ({ fetchVideos: args }),
  fetchCourseDetails: (args) => ({ fetchCourseDetails: args }),
}));

jest.mock('../../../utils', () => ({
  camelizeKeys: (args) => ([{ camelizeKeys: args }]),
  ...jest.requireActual('../../../utils'),
}));

const testValue = {
  data: {
    assets: 'test VALUE',
    videos: 'vIDeO vALUe',
  },
};

describe('app thunkActions', () => {
  let dispatch;
  let dispatchedAction;
  beforeEach(() => {
    dispatch = jest.fn((action) => ({ dispatch: action }));
  });
  describe('fetchBlock', () => {
    beforeEach(() => {
      thunkActions.fetchBlock()(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches fetchBlock action', () => {
      expect(dispatchedAction.fetchBlock).not.toEqual(undefined);
    });
    it('dispatches actions.app.setBlockValue on success', () => {
      dispatch.mockClear();
      dispatchedAction.fetchBlock.onSuccess(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.app.setBlockValue(testValue));
    });
    it('dispatches failRequest with fetchBlock requestKey on failure', () => {
      dispatch.mockClear();
      dispatchedAction.fetchBlock.onFailure(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.requests.failRequest({
        requestKey: RequestKeys.fetchBlock,
        error: testValue,
      }));
    });
  });

  describe('fetchStudioView', () => {
    beforeEach(() => {
      thunkActions.fetchStudioView()(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches fetchStudioView action', () => {
      expect(dispatchedAction.fetchStudioView).not.toEqual(undefined);
    });
    it('dispatches actions.app.setStudioViewe on success', () => {
      dispatch.mockClear();
      dispatchedAction.fetchStudioView.onSuccess(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.app.setStudioView(testValue));
    });
    it('dispatches failRequest with fetchStudioView requestKey on failure', () => {
      dispatch.mockClear();
      dispatchedAction.fetchStudioView.onFailure(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.requests.failRequest({
        requestKey: RequestKeys.fetchStudioView,
        error: testValue,
      }));
    });
  });

  describe('fetchUnit', () => {
    beforeEach(() => {
      thunkActions.fetchUnit()(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches fetchUnit action', () => {
      expect(dispatchedAction.fetchUnit).not.toEqual(undefined);
    });
    it('dispatches actions.app.setUnitUrl on success', () => {
      dispatch.mockClear();
      dispatchedAction.fetchUnit.onSuccess(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.app.setUnitUrl(testValue));
    });
    it('dispatches failRequest with fetchUnit requestKey on failure', () => {
      dispatch.mockClear();
      dispatchedAction.fetchUnit.onFailure(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.requests.failRequest({
        requestKey: RequestKeys.fetchUnit,
        error: testValue,
      }));
    });
  });
  describe('fetchImages', () => {
    beforeEach(() => {
      thunkActions.fetchImages({ pageNumber: 0 })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches fetchImages action', () => {
      expect(dispatchedAction.fetchImages).not.toEqual(undefined);
    });
    it('dispatches actions.app.setImages on success', () => {
      dispatch.mockClear();
      dispatchedAction.fetchImages.onSuccess({ images: {}, imageCount: 0 });
      expect(dispatch).toHaveBeenCalledWith(actions.app.setImages({ images: {}, imageCount: 0 }));
    });
    it('dispatches failRequest with fetchImages requestKey on failure', () => {
      dispatch.mockClear();
      dispatchedAction.fetchImages.onFailure(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.requests.failRequest({
        requestKey: RequestKeys.fetchImages,
        error: testValue,
      }));
    });
  });
  describe('fetchVideos', () => {
    beforeEach(() => {
      thunkActions.fetchVideos()(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches fetchImages action', () => {
      expect(dispatchedAction.fetchVideos).not.toEqual(undefined);
    });
    it('dispatches actions.app.setVideos on success', () => {
      dispatch.mockClear();
      dispatchedAction.fetchVideos.onSuccess(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.app.setVideos(testValue.data.videos));
    });
    it('dispatches failRequest with fetchVideos requestKey on failure', () => {
      dispatch.mockClear();
      dispatchedAction.fetchVideos.onFailure(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.requests.failRequest({
        requestKey: RequestKeys.fetchVideos,
        error: testValue,
      }));
    });
  });
  describe('fetchCourseDetails', () => {
    beforeEach(() => {
      thunkActions.fetchCourseDetails()(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches fetchUnit action', () => {
      expect(dispatchedAction.fetchCourseDetails).not.toEqual(undefined);
    });
    it('dispatches actions.app.setUnitUrl on success', () => {
      dispatch.mockClear();
      dispatchedAction.fetchCourseDetails.onSuccess(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.app.setCourseDetails(testValue));
    });
    it('dispatches failRequest with fetchCourseDetails requestKey on failure', () => {
      dispatch.mockClear();
      dispatchedAction.fetchCourseDetails.onFailure(testValue);
      expect(dispatch).toHaveBeenCalledWith(actions.requests.failRequest({
        requestKey: RequestKeys.fetchCourseDetails,
        error: testValue,
      }));
    });
  });
  describe('initialize without block type defined', () => {
    it('dispatches actions.app.initialize, and then fetches both block and unit', () => {
      const {
        fetchBlock,
        fetchUnit,
        fetchStudioView,
        fetchImages,
        fetchVideos,
        fetchCourseDetails,
      } = thunkActions;
      thunkActions.fetchBlock = () => 'fetchBlock';
      thunkActions.fetchUnit = () => 'fetchUnit';
      thunkActions.fetchStudioView = () => 'fetchStudioView';
      thunkActions.fetchImages = () => 'fetchImages';
      thunkActions.fetchVideos = () => 'fetchVideos';
      thunkActions.fetchCourseDetails = () => 'fetchCourseDetails';
      thunkActions.initialize(testValue)(dispatch);
      expect(dispatch.mock.calls).toEqual([
        [actions.app.initialize(testValue)],
        [thunkActions.fetchBlock()],
      ]);
      thunkActions.fetchBlock = fetchBlock;
      thunkActions.fetchUnit = fetchUnit;
      thunkActions.fetchStudioView = fetchStudioView;
      thunkActions.fetchImages = fetchImages;
      thunkActions.fetchVideos = fetchVideos;
      thunkActions.fetchCourseDetails = fetchCourseDetails;
    });
  });
  describe('initialize with block type html', () => {
    it('dispatches actions.app.initialize, and then fetches both block and unit', () => {
      const {
        fetchBlock,
        fetchUnit,
        fetchStudioView,
        fetchImages,
        fetchVideos,
        fetchCourseDetails,
      } = thunkActions;
      thunkActions.fetchBlock = () => 'fetchBlock';
      thunkActions.fetchUnit = () => 'fetchUnit';
      thunkActions.fetchStudioView = () => 'fetchStudioView';
      thunkActions.fetchImages = () => 'fetchImages';
      thunkActions.fetchVideos = () => 'fetchVideos';
      thunkActions.fetchCourseDetails = () => 'fetchCourseDetails';
      const data = {
        ...testValue,
        blockType: 'html',
        blockId: 'block-v1:UniversityX+PHYS+1+type@problem+block@123',
        learningContextId: 'course-v1:UniversityX+PHYS+1',
      };
      thunkActions.initialize(data)(dispatch);
      expect(dispatch.mock.calls).toEqual([
        [actions.app.initialize(data)],
        [thunkActions.fetchBlock()],
        [thunkActions.fetchUnit()],
        [thunkActions.fetchImages()],
      ]);
      thunkActions.fetchBlock = fetchBlock;
      thunkActions.fetchUnit = fetchUnit;
      thunkActions.fetchStudioView = fetchStudioView;
      thunkActions.fetchImages = fetchImages;
      thunkActions.fetchVideos = fetchVideos;
      thunkActions.fetchCourseDetails = fetchCourseDetails;
    });
  });
  describe('initialize with block type problem', () => {
    it('dispatches actions.app.initialize, and then fetches both block and unit', () => {
      const {
        fetchBlock,
        fetchUnit,
        fetchStudioView,
        fetchImages,
        fetchVideos,
        fetchCourseDetails,
      } = thunkActions;
      thunkActions.fetchBlock = () => 'fetchBlock';
      thunkActions.fetchUnit = () => 'fetchUnit';
      thunkActions.fetchStudioView = () => 'fetchStudioView';
      thunkActions.fetchImages = () => 'fetchImages';
      thunkActions.fetchVideos = () => 'fetchVideos';
      thunkActions.fetchCourseDetails = () => 'fetchCourseDetails';
      const data = {
        ...testValue,
        blockType: 'problem',
        blockId: 'block-v1:UniversityX+PHYS+1+type@problem+block@123',
        learningContextId: 'course-v1:UniversityX+PHYS+1',
      };
      thunkActions.initialize(data)(dispatch);
      expect(dispatch.mock.calls).toEqual([
        [actions.app.initialize(data)],
        [thunkActions.fetchBlock()],
        [thunkActions.fetchUnit()],
        [thunkActions.fetchImages()],
      ]);
      thunkActions.fetchBlock = fetchBlock;
      thunkActions.fetchUnit = fetchUnit;
      thunkActions.fetchStudioView = fetchStudioView;
      thunkActions.fetchImages = fetchImages;
      thunkActions.fetchVideos = fetchVideos;
      thunkActions.fetchCourseDetails = fetchCourseDetails;
    });
  });
  describe('initialize with block type video', () => {
    it('dispatches actions.app.initialize, and then fetches both block and unit', () => {
      const {
        fetchBlock,
        fetchUnit,
        fetchStudioView,
        fetchImages,
        fetchVideos,
        fetchCourseDetails,
      } = thunkActions;
      thunkActions.fetchBlock = () => 'fetchBlock';
      thunkActions.fetchUnit = () => 'fetchUnit';
      thunkActions.fetchStudioView = () => 'fetchStudioView';
      thunkActions.fetchImages = () => 'fetchImages';
      thunkActions.fetchVideos = () => 'fetchVideos';
      thunkActions.fetchCourseDetails = () => 'fetchCourseDetails';
      const data = {
        ...testValue,
        blockType: 'video',
        blockId: 'block-v1:UniversityX+PHYS+1+type@problem+block@123',
        learningContextId: 'course-v1:UniversityX+PHYS+1',
      };
      thunkActions.initialize(data)(dispatch);
      expect(dispatch.mock.calls).toEqual([
        [actions.app.initialize(data)],
        [thunkActions.fetchBlock()],
        [thunkActions.fetchUnit()],
        [thunkActions.fetchVideos()],
        [thunkActions.fetchStudioView()],
        [thunkActions.fetchCourseDetails()],
      ]);
      thunkActions.fetchBlock = fetchBlock;
      thunkActions.fetchUnit = fetchUnit;
      thunkActions.fetchStudioView = fetchStudioView;
      thunkActions.fetchImages = fetchImages;
      thunkActions.fetchVideos = fetchVideos;
      thunkActions.fetchCourseDetails = fetchCourseDetails;
    });
  });
  describe('saveBlock', () => {
    let returnToUnit;
    let calls;
    beforeEach(() => {
      returnToUnit = jest.fn();
      thunkActions.saveBlock(testValue, returnToUnit)(dispatch);
      calls = dispatch.mock.calls;
    });
    it('dispatches actions.app.setBlockContent with content, before dispatching saveBlock', () => {
      expect(calls[0]).toEqual([actions.app.setBlockContent(testValue)]);
      const saveCall = calls[1][0];
      expect(saveCall.saveBlock).not.toEqual(undefined);
    });
    it('dispatches saveBlock with passed content', () => {
      expect(calls[1][0].saveBlock.content).toEqual(testValue);
    });
    it('dispatches actions.app.setSaveResponse with response and then calls returnToUnit', () => {
      dispatch.mockClear();
      const response = 'testRESPONSE';
      calls[1][0].saveBlock.onSuccess(response);
      expect(dispatch).toHaveBeenCalledWith(actions.app.setSaveResponse(response));
      expect(returnToUnit).toHaveBeenCalled();
    });
  });
  describe('uploadAsset', () => {
    const setSelection = jest.fn();
    beforeEach(() => {
      thunkActions.uploadAsset({ file: testValue, setSelection })(dispatch);
      [[dispatchedAction]] = dispatch.mock.calls;
    });
    it('dispatches uploadAsset action', () => {
      expect(dispatchedAction.uploadAsset).not.toBe(undefined);
    });
    test('passes file as image prop', () => {
      expect(dispatchedAction.uploadAsset.asset).toEqual(testValue);
    });
    test('onSuccess: calls setSelection with camelized response.data.asset', () => {
      dispatchedAction.uploadAsset.onSuccess({ data: { asset: testValue } });
      expect(setSelection).toHaveBeenCalledWith(camelizeKeys(testValue));
    });
  });
});

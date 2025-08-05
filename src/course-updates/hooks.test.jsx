import moment from 'moment';
import { REQUEST_TYPES } from './constants';
import {
  createCourseUpdateQuery,
  editCourseUpdateQuery,
  editCourseHandoutsQuery,
} from './data/thunk';
import { COMMA_SEPARATED_DATE_FORMAT } from '../constants';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('./data/thunk', () => ({
  createCourseUpdateQuery: jest.fn(),
  editCourseUpdateQuery: jest.fn(),
  editCourseHandoutsQuery: jest.fn(),
}));

jest.mock('../constants', () => ({
  COMMA_SEPARATED_DATE_FORMAT: 'YYYY,MM,DD',
}));

describe('handleUpdatesSubmit', () => {
  let dispatchMock;
  let closeUpdateFormMock;
  let setCurrentUpdateMock;

  const courseId = 'course-v1:test+T101+2025_T1';

  beforeEach(() => {
    dispatchMock = jest.fn();
    closeUpdateFormMock = jest.fn();
    setCurrentUpdateMock = jest.fn();

    jest.requireActual('./hooks');
  });

  const getMockHookContext = (requestType) => {
    jest.requireActual('../hooks');

    return {
      requestType,
      courseId,
      closeUpdateForm: closeUpdateFormMock,
      setCurrentUpdate: setCurrentUpdateMock,
      dispatch: dispatchMock,
      initialUpdate: { id: 0, date: moment().toDate(), content: '' },
    };
  };

  const testData = {
    id: 5,
    content: 'Sample content',
    date: new Date('2025-08-01T00:00:00Z'),
  };

  it('dispatches createCourseUpdateQuery when requestType is add_new_update', () => {
    const formattedDate = moment(testData.date).format(COMMA_SEPARATED_DATE_FORMAT);
    createCourseUpdateQuery.mockReturnValue('mockCreateAction');

    const context = getMockHookContext(REQUEST_TYPES.add_new_update);
    const submitFn = (data) => {
      const date = moment(data.date).format(COMMA_SEPARATED_DATE_FORMAT);
      const action = createCourseUpdateQuery(context.courseId, {
        date,
        content: data.content,
      });
      context.closeUpdateForm();
      context.setCurrentUpdate(context.initialUpdate);
      context.dispatch(action);
    };

    submitFn(testData);

    expect(createCourseUpdateQuery).toHaveBeenCalledWith(courseId, {
      date: formattedDate,
      content: 'Sample content',
    });
    expect(dispatchMock).toHaveBeenCalledWith('mockCreateAction');
    expect(closeUpdateFormMock).toHaveBeenCalled();
    expect(setCurrentUpdateMock).toHaveBeenCalledWith(expect.objectContaining({ id: 0 }));
  });

  it('dispatches editCourseUpdateQuery when requestType is edit_update', () => {
    const formattedDate = moment(testData.date).format(COMMA_SEPARATED_DATE_FORMAT);
    editCourseUpdateQuery.mockReturnValue('mockEditAction');

    const context = getMockHookContext(REQUEST_TYPES.edit_update);
    const submitFn = (data) => {
      const date = moment(data.date).format(COMMA_SEPARATED_DATE_FORMAT);
      const action = editCourseUpdateQuery(context.courseId, {
        id: data.id,
        date,
        content: data.content,
      });
      context.closeUpdateForm();
      context.setCurrentUpdate(context.initialUpdate);
      context.dispatch(action);
    };

    submitFn(testData);

    expect(editCourseUpdateQuery).toHaveBeenCalledWith(courseId, {
      id: 5,
      date: formattedDate,
      content: 'Sample content',
    });
    expect(dispatchMock).toHaveBeenCalledWith('mockEditAction');
    expect(closeUpdateFormMock).toHaveBeenCalled();
    expect(setCurrentUpdateMock).toHaveBeenCalledWith(expect.objectContaining({ id: 0 }));
  });

  it('dispatches editCourseHandoutsQuery when requestType is edit_handouts', () => {
    editCourseHandoutsQuery.mockReturnValue('mockHandoutAction');

    const context = getMockHookContext(REQUEST_TYPES.edit_handouts);
    const submitFn = (data) => {
      const formatted = {
        ...data,
        date: moment(data.date).format(COMMA_SEPARATED_DATE_FORMAT),
        data: data.data || '',
      };
      const action = editCourseHandoutsQuery(context.courseId, formatted);
      context.closeUpdateForm();
      context.setCurrentUpdate(context.initialUpdate);
      context.dispatch(action);
    };

    submitFn(testData);

    expect(editCourseHandoutsQuery).toHaveBeenCalledWith(courseId, expect.objectContaining({
      date: expect.any(String),
      content: 'Sample content',
    }));
    expect(dispatchMock).toHaveBeenCalledWith('mockHandoutAction');
    expect(closeUpdateFormMock).toHaveBeenCalled();
    expect(setCurrentUpdateMock).toHaveBeenCalledWith(expect.objectContaining({ id: 0 }));
  });
  it('extracts date without formatting for internal logic', () => {
    getMockHookContext(REQUEST_TYPES.edit_update);

    const submitFn = (data) => {
      const dateWithoutTimezone = data.date;
      expect(dateWithoutTimezone).toEqual(new Date('2025-08-01T00:00:00Z'));
    };

    submitFn(testData);
  });
});

import { act, renderHook } from '@testing-library/react';
import { initializeMocks, makeWrapper } from '@src/testUtils';
import { RequestStatus } from '@src/data/constants';
import { updateOutlineIndexLoadingStatus } from './data/slice';
import { useCourseOutline } from './hooks';

jest.mock('@src/CourseAuthoringContext', () => ({ useCourseAuthoringContext: () => ({}) }));
jest.mock('./CourseOutlineContext', () => ({
  useCourseOutlineContext: () => ({ getHandleDeleteItemSubmit: () => jest.fn() }),
}));
jest.mock('@src/course-outline/outline-sidebar/OutlineSidebarContext', () => ({
  useOutlineSidebarContext: () => ({ selectedContainerState: {} }),
}));

describe('native outline checklist scheduling', () => {
  let mocks;
  let idleCallbacks;
  const originalIdle = window.requestIdleCallback;
  const originalCancel = window.cancelIdleCallback;
  const mount = () =>
    renderHook(({ courseId }) => useCourseOutline({ courseId }), {
      initialProps: { courseId: 'course-v1:Test+Demo+2026' },
      wrapper: makeWrapper(),
    });
  const ready = () =>
    act(() => {
      mocks.reduxStore.dispatch(updateOutlineIndexLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    });

  beforeEach(() => {
    mocks = initializeMocks();
    mocks.axiosMock.onGet().reply(200, {});
    idleCallbacks = [];
    window.requestIdleCallback = jest.fn((callback) => {
      idleCallbacks.push(callback);
      return idleCallbacks.length;
    });
    window.cancelIdleCallback = jest.fn();
  });
  afterEach(() => {
    window.requestIdleCallback = originalIdle;
    window.cancelIdleCallback = originalCancel;
    jest.useRealTimers();
  });

  it.each([RequestStatus.IN_PROGRESS, RequestStatus.FAILED, RequestStatus.DENIED])(
    'does not start checklist requests while the outline is %s',
    (status) => {
      mocks.reduxStore.dispatch(updateOutlineIndexLoadingStatus({ status }));
      mount();
      expect(window.requestIdleCallback).not.toHaveBeenCalled();
      expect(mocks.axiosMock.history.get).toHaveLength(0);
    },
  );

  it('starts both native checklist requests once, after readiness and idle', async () => {
    const view = mount();
    ready();
    expect(window.requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), { timeout: 1500 });
    expect(mocks.axiosMock.history.get).toHaveLength(0);
    await act(async () => {
      idleCallbacks[0]();
    });
    expect(mocks.axiosMock.history.get).toHaveLength(2);
    expect(mocks.axiosMock.history.get.every(({ url }) => url.includes('course-v1:Test+Demo+2026'))).toBe(true);
    view.rerender({ courseId: 'course-v1:Test+Demo+2026' });
    expect(window.requestIdleCallback).toHaveBeenCalledTimes(1);
  });

  it('rejects a late callback for the old course even if idle cancellation is unavailable', async () => {
    window.cancelIdleCallback = undefined;
    const view = mount();
    ready();
    view.rerender({ courseId: 'course-v1:Other+Demo+2026' });
    await act(async () => {
      idleCallbacks[0]();
    });
    expect(mocks.axiosMock.history.get).toHaveLength(0);
    await act(async () => {
      idleCallbacks[1]();
    });
    expect(mocks.axiosMock.history.get).toHaveLength(2);
    expect(mocks.axiosMock.history.get.every(({ url }) => url.includes('course-v1:Other+Demo+2026'))).toBe(true);
  });

  it('rejects a late callback after unmount', async () => {
    const view = mount();
    ready();
    view.unmount();
    expect(window.cancelIdleCallback).toHaveBeenCalledWith(1);
    await act(async () => {
      idleCallbacks[0]();
    });
    expect(mocks.axiosMock.history.get).toHaveLength(0);
  });

  it('uses a deferred timer when the browser does not implement idle callbacks', async () => {
    window.requestIdleCallback = undefined;
    jest.useFakeTimers();
    mount();
    ready();
    expect(mocks.axiosMock.history.get).toHaveLength(0);
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    expect(mocks.axiosMock.history.get).toHaveLength(2);
  });
});

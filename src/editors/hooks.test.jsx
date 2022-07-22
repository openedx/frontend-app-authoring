import { useEffect } from 'react';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import analyticsEvt from './data/constants/analyticsEvt';

import { keyStore } from './utils';
import { thunkActions } from './data/redux';
import * as hooks from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

jest.mock('./data/redux', () => ({
  thunkActions: {
    app: {
      initialize: (args) => ({ initializeApp: args }),
      saveBlock: (args) => ({ saveBlock: args }),
    },
  },
  selectors: {
    app: {
      returnUrl: jest.fn(),
    },
  },
}));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

const hookKeys = keyStore(hooks);

describe('hooks', () => {
  const locationTemp = window.location;
  beforeAll(() => {
    delete window.location;
    window.location = {
      assign: jest.fn(),
    };
  });
  afterAll(() => {
    window.location = locationTemp;
  });

  describe('initializeApp', () => {
    test('calls provided function with provided data as args when useEffect is called', () => {
      const dispatch = jest.fn();
      const fakeData = { some: 'data' };
      hooks.initializeApp({ dispatch, data: fakeData });
      expect(dispatch).not.toHaveBeenCalledWith(fakeData);
      const [cb, prereqs] = useEffect.mock.calls[0];
      expect(prereqs).toStrictEqual([fakeData]);
      cb();
      expect(dispatch).toHaveBeenCalledWith(thunkActions.app.initialize(fakeData));
    });
  });

  describe('navigateTo', () => {
    const destination = 'HoME';
    beforeEach(() => {
      hooks.navigateTo(destination);
    });
    test('it calls window assign', () => {
      expect(window.location.assign).toHaveBeenCalled();
    });
  });

  describe('navigateCallback', () => {
    let output;
    const SAVED_ENV = process.env;
    const destination = 'hOmE';
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...SAVED_ENV };
      output = hooks.navigateCallback({ destination });
    });
    afterAll(() => {
      process.env = SAVED_ENV;
    });
    test('it calls sendTrackEvent if given analyticsEvent and analytics', () => {
      process.env.NODE_ENV = 'prod';
      const analyticsEvent = 'iThapPeneDEVent';
      const analytics = 'dATAonEveNT';
      output = hooks.navigateCallback({
        destination,
        analyticsEvent,
        analytics,
      });
      output();
      expect(sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(sendTrackEvent).toHaveBeenCalledWith(analyticsEvent, analytics);
    });
    test('it calls navigateTo with output destination', () => {
      const spy = jest.spyOn(hooks, hookKeys.navigateTo);
      output();
      expect(spy).toHaveBeenCalledWith(destination);
    });
  });

  describe('nullMethod', () => {
    it('returns an empty object', () => {
      expect(hooks.nullMethod()).toEqual({});
    });
  });

  describe('saveBlock', () => {
    it('dispatches thunkActions.app.saveBlock with navigateCallback, and passed content', () => {
      const navigateCallback = (args) => ({ navigateCallback: args });
      const dispatch = jest.fn();
      const destination = 'uRLwhENsAved';
      const analytics = 'dATAonEveNT';
      const content = 'myContent';
      jest.spyOn(hooks, hookKeys.navigateCallback).mockImplementationOnce(navigateCallback);
      hooks.saveBlock({
        content,
        destination,
        analytics,
        dispatch,
      });
      expect(dispatch).toHaveBeenCalledWith(thunkActions.app.saveBlock({
        returnToUnit: navigateCallback({
          destination,
          analyticsEvent: analyticsEvt.editorSaveClick,
          analytics,
        }),
        content,
      }));
    });
  });
});

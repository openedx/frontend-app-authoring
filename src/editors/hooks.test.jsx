import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { keyStore } from './utils';
import { selectors, thunkActions } from './data/redux';
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
      expect(prereqs).toStrictEqual([]);
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
    const destination = 'hOmE';
    beforeEach(() => {
      output = hooks.navigateCallback(destination);
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
      const content = 'myContent';
      jest.spyOn(hooks, hookKeys.navigateCallback).mockImplementationOnce(navigateCallback);
      hooks.saveBlock({ content, dispatch });
      expect(dispatch).toHaveBeenCalledWith(thunkActions.app.saveBlock({
        returnToUnit: navigateCallback(useSelector(selectors.app.returnUrl)),
        content,
      }));
    });
  });
});

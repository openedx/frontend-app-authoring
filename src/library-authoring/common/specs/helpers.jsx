// eslint-disable-next-line import/no-extraneous-dependencies
import jest from 'jest-mock';
import { render } from '@testing-library/react';
import AppContext from '@edx/frontend-platform/react/AppContext';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import * as React from 'react';

/**
 * mocksFromNames
 * Given an iterable of strings, creates an object with those strings as properties and the values as mocks.
 * @param names
 * @returns {{}}
 */
export function mocksFromNames(names) {
  const result = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const name of names) {
    result[name] = jest.fn();
  }
  return result;
}

/**
 * toInfiniteGenerator
 *
 * Turns any iterable into a generator that never exhausts, but instead returns 'undefined' after the initial iterator
 * is exhausted.
 *
 * @param iterable Iterable<any>
 * @returns {Generator<undefined|any, void, *>}
 */
function* toInfiniteGenerator(iterable) {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of iterable) {
    yield item;
  }
  while (true) {
    yield undefined;
  }
}

/**
 * manufacturer
 * A function for cranking out instances from a factory. For example, if you have a factory named 'userFactory',
 * you can call this on that factory and get a generator function that can produce users on demand.
 *
 * The resulting function can be handed a list of overrides that will be used to override the defaults of the users.
 *
 * const userFactoryLine = manufacturer(userFactory)
 * const [user1, user2, user3, user4] = userFactoryLine([{username: 'Dude'}, {}, {email: 'stuff@things.com}])
 *
 * ...will create user1 with the username 'Dude', user2 with the defaults, user3 with the email 'stuff@things.com',
 * and user4 with the defaults.
 *
 * If you don't need to unpack the manufactured objects into variable names, but just need a quick list of objects, you
 * can use the makeN function below.
 *
 * const line = userFactoryLine([{username: 'Dude'}, {}, {email: 'stuff@things.com}])
 * const users = makeN(line, 6)
 *
 * @param wrapped: A factory function.
 * @returns {function(*=): Generator<*, void, *>}
 */
export function makeManufacturer(wrapped) {
  // I've stretched this metaphor so far I think I can see through it.
  function* conveyorBelt(overridesList) {
    const infiniteGenerator = toInfiniteGenerator(overridesList || []);
    while (true) {
      yield wrapped(infiniteGenerator.next().value);
    }
  }

  return conveyorBelt;
}

/**
 * makeN
 *
 * Takes a generator and runs over it N times, returning the results in an array.
 *
 * @param generator Generator<any>: A generator function
 * @param count: A number indicating how many iterations of the generator you want to pull into an array.
 * @returns {any[]}
 */
export function makeN(generator, count) {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push(generator.next().value);
  }
  return result;
}

export const ctxRender = (ui, context) => render(
  <AppContext.Provider value={context}>
    <IntlProvider locale="en">
      {ui}
    </IntlProvider>
  </AppContext.Provider>,
);

/**
 * immediate
 *
 * Creates a promise which resolves immediately with a given value. Good for use when an API requires a promise, but
 * you already have the required data.
 *
 * @param val
 * @returns {Promise<any>}
 */
export function immediate(val) {
  return new Promise((resolve) => {
    resolve(val);
  });
}

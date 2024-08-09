# Internal editor testability decision

# Increased complexity for the sake of testability
The internally-managed editors in this repo (as of now planned to include text, video, and problem types) follow a number of patterns that increase the complexity of parts of the code slightly, in favor of providing increased testability around their behavior.

## Note - Strict Dictionaries
Javacript is generally fairly lackadaisical with regards to dictionary access of missing/invalid keys.  This is fine and expected in many cases, but also prevents us from using dictionary access on something like a key store to ensure we are calling something that actually exists.

For this purpose, there are a pair of utilities in this repo called `StrictDict` and `keyStore`.

`StrictDict` takes an object and returns a version that will complain (throw an error) if called with an invalid key.

`keyStore` takes an object and returns a StrictDict of just the keys of that object.  (this is useful particularly for mocking and spying on specific methods and fields)

## Note - Self imports
Javascript webpack imports can be problematic around the specific issue of attempting to mock a single method being used in another method in the same file.  

Problem: File A includes methodA and methodB (which calls methodA).  We want to be able to test methodA and then test methodB *without* having to re-test methodA as part of that test.  We want to be able to mock methodA *only* while we are testing methodB.

Solution: Self-imports.  By importing the module into itself (which webpack handles nicely, don't worry), we provide tests the ability to spy on and mock individual methods from that module separately on a per-test basis.

Ex:
```javascript
// myFile.js
import * as module from './myFile';

export const methodA = (val) => // do something complex with val and return a number
export const methodB = (val) => module.methodA(val) * 2;

// myFile.test.js
import * as module from './myFile';
import { keyStore } from './utils';

cosnt moduleKeys = keyStore(module);

describe('myFile', () => {
  describe('methodA', () => ...);
  describe('methodB', () => {
    const mockMethodA = (val) => val + 3
    const testValue = 23;
    beforeEach(() => {
      jest.spyOn(module, moduleKeys).mockImplementationValueOnce(mockMethodA);
    });
    it('returns double the output of methodA with the given value', () => {
      expect(module.methodB(testValue)).toEqual(mockMethodA(testValue) + 3);
    });
  });
});
```

## Hooks and Snapshots - Separation from components for increased viability of snapshots
As part of the testing of these internal editors, we are relying on snapshot testing to ensure stability of the display of the components themselves.  This can be a fragile solution in certain situations where components are too large or complex to adequately snapshot and verify.

For this purpose, we have opted for a general pattern of separating all of the behavior of components withing these editors into separate `hooks` files.

These hook files contain methods that utilize both `react` and `react-redux` hooks, along with arguments passed directly into the component, in order to generate the resulting desired behaviors.

From there, components are tested by mocking out the behavior of these hooks to return verifyable data in the snapshots.

As part of this separation, there are a number of additional patterns that are followed 

### Snapshot considerations
#### Callbacks
Any callback that is included in render in a component should be separated such that is is either passed in as a prop or derived from a hook, and should be mocked with a `mockName` using jest, to ensure that they are uniquely identifyable in the snapshots.

Ex: 
```javascript
const props = {
  onClick: jest.fn().mockName('props.onClick');
}
expect(shallow(<MyElement {...props} />)).toMatchSnapshot();
```

#### Imported components
Imported compoents are mocked to return simple string components based on their existing name.  This results in shallow renders that display the components by name, with passed props, but do not attempt to render *any* logic from those components.

This is a bit more complex for components with sub-components, but we have provided a test utility in `src/testUtils` called `mockNestedComponent` that will allow you to easily mock these for your snapshots as well.

Ex:
```javascript
jest.mock('componentModule', () => {
  const { mockNestedComponent } = jest.requireActual('./testUtils');
  return {
    SimpleComponents: () => 'SimpleComponent',
    NestedComponent: mockNestedComponent('NestedComponent', {
      NestedChild1: 'NestedComponent.NestedChild1',
      NestedChild2: 'NestedComponent.NestedChild2',
    }),
});
```
#### Top-level mocked imports
We have mocked out all paragon components and icons being used in the repo, as well as a number of other common methods, hooks, and components in our module's `setupTests` file, which will ensure that those components show up reasonably in snapshots.

### Hook Considerations
#### useState and mockUseState
React's useState hook is a very powerful alternative to class components, but is also somewhat problematic to test, as it returns different values based on where it is called in a hook, as well as based on previous runs of that hook.

To resolve this, we are using a custom test utility to mock a hook modules state values for easy testing.

This requires a particular structure to hook modules that use the useState, for the sake of enabling the mock process (which is documented with the utility).

Ex:
```javascript
import * as module from './hooks';
const state = {
  myStateValue: (val) => useState(val),
};
const myHook = () => {
  const [myStateValue, setMyStateValue] = module.state.myStateValue('initialValue');
};
```
Examples on how to use this for testing are included with the mock class in `src/testUtils`

#### useCallback, useEffect
These hooks provide behavior that calls a method based on given prerequisite behaviors.
For this reason, we use general-purpose mocks for these hooks that return an object containing the passed callback and prerequisites for easy test access.

#### Additional Considrations
*useIntl not available*

We are using react-intl under the hood for our i18n support, but do not have access to some of the more recent features in that library due to the pinned version in frontend-platform.  Specifically, this includes a `useIntl` hook available in later versions that is still unavailable to us, requiring us to use the older `injectIntl` pattern.

*useDispatch*

React-redux's `useDispatch` hook does not play nicely with being called in a method called by a component, and really wants to be called *in* the component.  For this reason, the dispatch method is generated in components and passed through to hook components.

## Notes for integration testing
Because of the top-level mocks in setupTest, any integration tests will need to be sure to unmock most of these.

Ex:
```javascript
jest.unmock('@edx/frontend-platform/i18n');
jest.unmock('@openedx/paragon');
jest.unmock('@openedx/paragon/icons');
jest.unmock('react-redux');
```

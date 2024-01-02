import { libraryAccessInitialState, reducers } from '../slice';
import { LOADING_STATUS, SUBMISSION_STATUS } from '../../../common/data';
import { userFactoryLine } from '../../../common/specs/factories';
import { makeN } from '../../../common/specs/helpers';

describe('library-access/data/slice.js', () => {
  it('Marks the loading state', () => {
    const state = {};
    reducers.libraryAccessRequest(state);
    expect(state.status).toBe(LOADING_STATUS.LOADING);
  });
  it('Marks a failure state with errors', () => {
    const state = {};
    reducers.libraryAccessFailed(state, { payload: { errorMessage: 'It borked.', errorFields: { email: 'Phony email.' } } });
    expect(state.status).toBe(LOADING_STATUS.FAILED);
    expect(state.errorMessage).toBe('It borked.');
    expect(state.errorFields).toEqual({ email: 'Phony email.' });
  });
  it('Clears error state', () => {
    const state = {
      status: SUBMISSION_STATUS.FAILED,
      errorMessage: 'It borked.',
      errorFields: { email: 'That ISP doesn\t even exist anymore!' },
    };
    reducers.libraryAccessClearError(state);
    expect(state.status).toBe(SUBMISSION_STATUS.UNSUBMITTED);
    expect(state.errorFields).toBe(null);
    expect(state.errorMessage).toBe(null);
  });
  it('Adds a user to the user list.', () => {
    const state = {
      users: makeN(userFactoryLine(), 5),
    };
    const [user] = userFactoryLine();
    reducers.libraryAddUser(state, { payload: { user } });
    expect(state.users.length).toBe(6);
    expect(state.users[0].username).toEqual(user.username);
  });
  it('Removes a user from the user list.', () => {
    const state = {
      users: makeN(userFactoryLine(), 5),
    };
    const user = state.users[3];
    reducers.libraryRemoveUser(state, { payload: { user } });
    expect(state.users.length).toBe(4);
    expect(state.users.map(leftBehind => leftBehind.username).includes(user.username)).toBe(false);
  });
  it('Updates a user', () => {
    const state = {
      users: makeN(userFactoryLine(), 5),
    };
    const oldUser = state.users[3];
    const user = { ...oldUser };
    user.email = 'new_email@example.com';
    reducers.libraryUpdateUser(state, { payload: { user } });
    expect(state.users[3].email).toBe('new_email@example.com');
  });
  it('Sets the userlist', () => {
    const state = { users: null };
    const users = makeN(userFactoryLine(), 3);
    reducers.libraryUsersSuccess(state, { payload: { users } });
    expect(users).toEqual(state.users);
  });
  it('Resets the state', () => {
    const state = { ...libraryAccessInitialState };
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(state)) {
      state[key] = 'Bogus value';
    }
    reducers.libraryAccessClear(state);
    expect(state).toEqual(libraryAccessInitialState);
  });
});

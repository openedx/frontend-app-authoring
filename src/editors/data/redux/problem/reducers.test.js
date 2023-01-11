import { initialState, actions, reducer } from './reducers';

const testingState = {
  ...initialState,
  arbitraryField: 'arbitrary',
};

describe('problem reducer', () => {
  it('has initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  const testValue = 'roll for initiative';

  describe('handling actions', () => {
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
      ['updateQuestion', 'question'],
    ].map(args => setterTest(...args));
    describe('load', () => {
      it('sets answers', () => {
        const answer = {
          id: 'A',
          correct: false,
          selectedFeedback: '',
          title: '',
          unselectedFeedback: undefined,
        };
        expect(reducer(testingState, actions.addAnswer(answer))).toEqual({
          ...testingState,
          answers: [answer],
        });
      });
    });
    describe('setEnableTypeSelection', () => {
      it('sets problemType to null', () => {
        expect(reducer(testingState, actions.setEnableTypeSelection())).toEqual({
          ...testingState,
          problemType: null,
        });
      });
    });
    describe('updateField', () => {
      it('sets given parameter', () => {
        const payload = { problemType: 'soMePRoblEMtYPe' };
        expect(reducer(testingState, actions.updateField(payload))).toEqual({
          ...testingState,
          ...payload,
        });
      });
    });
    describe('updateSettings', () => {
      it('sets given settings parameter', () => {
        const payload = { hints: ['soMehInt'] };
        expect(reducer(testingState, actions.updateSettings(payload))).toEqual({
          ...testingState,
          settings: {
            ...testingState.settings,
            ...payload,
          },
        });
      });
    });
    describe('addAnswer', () => {
      it('sets answers', () => {
        const answer = {
          id: 'A',
          correct: false,
          selectedFeedback: '',
          title: '',
          unselectedFeedback: '',
        };
        expect(reducer({ ...testingState, problemType: 'choiceresponse' }, actions.addAnswer())).toEqual({
          ...testingState,
          problemType: 'choiceresponse',
          answers: [answer],
        });
      });
    });
    describe('updateAnswer', () => {
      it('sets answers, as well as setting the correctAnswerCount ', () => {
        const answer = { id: 'A', correct: true };
        expect(reducer(
          {
            ...testingState,
            answers: [{
              id: 'A',
              correct: false,
            }],
          },
          actions.updateAnswer(answer),
        )).toEqual({
          ...testingState,
          correctAnswerCount: 1,
          answers: [{ id: 'A', correct: true }],
        });
      });
    });
    describe('deleteAnswer', () => {
      it('sets answers, as well as setting the correctAnswerCount ', () => {
        const answer = { id: 'A' };
        expect(reducer(
          {
            ...testingState,
            correctAnswerCount: 1,
            answers: [{
              id: 'A',
              correct: false,
            },
            {
              id: 'B',
              correct: true,
            }],
          },
          actions.deleteAnswer(answer),
        )).toEqual({
          ...testingState,
          correctAnswerCount: 1,
          answers: [
            {
              id: 'A',
              correct: true,
            }],
        });
      });
    });
  });
});

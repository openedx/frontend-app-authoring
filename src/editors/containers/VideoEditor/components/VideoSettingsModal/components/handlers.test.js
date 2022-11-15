import * as handlers from './handlers';

const handler = jest.fn(cb => ({ handler: cb }));
const transform = jest.fn((...args) => ({ transform: args }));
const setter = jest.fn(val => ({ setter: val }));
const index = 'test-index';
const val = 'TEST value';
const local = 'local-test-value';
describe('Video Settings Modal event handler methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('handleIndexEvent', () => {
    describe('returned method', () => {
      it('takes index and calls handler with transform handler based on index', () => {
        expect(
          handlers.handleIndexEvent({ handler, transform })(index).handler(val),
        ).toEqual(transform(index, val));
      });
    });
  });
  describe('handleIndexTransformEvent', () => {
    describe('returned method', () => {
      it('takes index and calls handler with setter(transform(local, index, val))', () => {
        expect(
          handlers.handleIndexTransformEvent({
            handler,
            setter,
            local,
            transform,
          })(index).handler(val),
        ).toEqual(setter(transform(local, index, val)));
      });
    });
  });
  describe('onValue', () => {
    describe('returned method', () => {
      it('calls handler with event.target.value', () => {
        expect(handlers.onValue(handler)({ target: { value: val } })).toEqual(handler(val));
      });
    });
  });
  describe('onChecked', () => {
    describe('returned method', () => {
      it('calls handler with event.target.checked', () => {
        expect(handlers.onChecked(handler)({ target: { checked: val } })).toEqual(handler(val));
      });
    });
  });
  describe('onEvent', () => {
    describe('returned method', () => {
      it('calls handler with event', () => {
        expect(handlers.onEvent(handler)(val)).toEqual(handler(val));
      });
    });
  });
});

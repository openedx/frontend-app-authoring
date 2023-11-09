import { importTaxonomy } from './actions';

jest.mock('./api', () => ({
  importNewTaxonomy: jest.fn().mockResolvedValue({}),
}));

const mockAddEventListener = jest.fn();

const intl = {
  formatMessage: jest.fn(),
};

describe('import taxonomy actions', () => {
  let createElement;
  let appendChild;
  let removeChild;

  beforeEach(() => {
    createElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((element) => {
      if (element === 'input') {
        return {
          click: jest.fn(),
          addEventListener: mockAddEventListener,
        };
      }
      return createElement(element);
    });

    appendChild = document.body.appendChild;
    document.body.appendChild = jest.fn();

    removeChild = document.body.removeChild;
    document.body.removeChild = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.createElement = createElement;
    document.body.appendChild = appendChild;
    document.body.removeChild = removeChild;
  });

  it('should call the api', async () => {
    jest.spyOn(window, 'prompt')
      .mockReturnValueOnce('test taxonomy name')
      .mockReturnValueOnce('test taxonomy description');
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    importTaxonomy(intl).then();

    // Capture the onChange handler from the file input element
    const onChange = mockAddEventListener.mock.calls[0][1];
    const mockTarget = {
      target: {
        files: [
          'mockFile',
        ],
      },
    };

    onChange(mockTarget);
  });

  it('should abort the call to the api without file', async () => {
    importTaxonomy(intl).then();

    // Capture the onChange handler from the file input element
    const onChange = mockAddEventListener.mock.calls[0][1];
    const mockTarget = {
      target: {
        files: [null],
      },
    };

    onChange(mockTarget);
  });

  it('should abort the call to the api without name', async () => {
    jest.spyOn(window, 'prompt').mockReturnValueOnce(null);

    importTaxonomy(intl).then();

    // Capture the onChange handler from the file input element
    const onChange = mockAddEventListener.mock.calls[0][1];
    const mockTarget = {
      target: {
        files: [
          'mockFile',
        ],
      },
    };

    onChange(mockTarget);
  });
});

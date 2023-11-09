import { importTaxonomy } from './actions';
import { importNewTaxonomy } from './api';

const mockAddEventListener = jest.fn();

const intl = {
  formatMessage: jest.fn().mockImplementation((message) => message.defaultMessage),
};

jest.mock('./api', () => ({
  importNewTaxonomy: jest.fn().mockResolvedValue({}),
}));

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

  it('should call the api and show success alert', async () => {
    jest.spyOn(window, 'prompt')
      .mockReturnValueOnce('test taxonomy name')
      .mockReturnValueOnce('test taxonomy description');
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    const promise = importTaxonomy(intl).then(() => {
      expect(importNewTaxonomy).toHaveBeenCalledWith('test taxonomy name', 'test taxonomy description', 'mockFile');
      expect(window.alert).toHaveBeenCalledWith('Taxonomy imported successfully');
    });

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

    return promise;
  });

  it('should call the api and return error alert', async () => {
    jest.spyOn(window, 'prompt')
      .mockReturnValueOnce('test taxonomy name')
      .mockReturnValueOnce('test taxonomy description');
    importNewTaxonomy.mockRejectedValue(new Error('test error'));

    const promise = importTaxonomy(intl).then(() => {
      expect(importNewTaxonomy).toHaveBeenCalledWith('test taxonomy name', 'test taxonomy description', 'mockFile');
    });

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

    return promise;
  });

  it('should abort the call to the api without file', async () => {
    const promise = importTaxonomy(intl).then(() => {
      expect(importNewTaxonomy).not.toHaveBeenCalled();
    });

    // Capture the onChange handler from the file input element
    const onChange = mockAddEventListener.mock.calls[0][1];
    const mockTarget = {
      target: {
        files: [null],
      },
    };

    onChange(mockTarget);
    return promise;
  });

  it('should abort the call to the api when cancel name prompt', async () => {
    jest.spyOn(window, 'prompt').mockReturnValueOnce(null);

    const promise = importTaxonomy(intl).then(() => {
      expect(importNewTaxonomy).not.toHaveBeenCalled();
    });

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

    return promise;
  });

  it('should abort the call to the api when cancel description prompt', async () => {
    jest.spyOn(window, 'prompt')
      .mockReturnValueOnce('test taxonomy name')
      .mockReturnValueOnce(null);

    const promise = importTaxonomy(intl).then(() => {
      expect(importNewTaxonomy).not.toHaveBeenCalled();
    });

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
    return promise;
  });
});

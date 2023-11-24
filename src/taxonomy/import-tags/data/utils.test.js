import { importTaxonomy, importTaxonomyTags } from './utils';
import { importNewTaxonomy, importTags } from './api';

const mockAddEventListener = jest.fn();

const intl = {
  formatMessage: jest.fn().mockImplementation((message) => message.defaultMessage),
};

jest.mock('./api', () => ({
  importNewTaxonomy: jest.fn().mockResolvedValue({}),
  importTags: jest.fn().mockResolvedValue({}),
}));

describe('import new taxonomy functions', () => {
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
          style: {},
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

  describe('import new taxonomy', () => {
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

    it('should ask for taxonomy name again if not provided', async () => {
      jest.spyOn(window, 'prompt')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('test taxonomy name')
        .mockReturnValueOnce('test taxonomy description');
      jest.spyOn(window, 'alert').mockImplementation(() => {});

      const promise = importTaxonomy(intl).then(() => {
        expect(importNewTaxonomy).toHaveBeenCalledWith('test taxonomy name', 'test taxonomy description', 'mockFile');
        expect(window.alert).toHaveBeenCalledWith('You must enter a name for the new taxonomy');
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

    it('should abort the call to the api if file closed', async () => {
      const promise = importTaxonomy(intl).then(() => {
        expect(importNewTaxonomy).not.toHaveBeenCalled();
      });

      // Capture the onCancel handler from the file input element
      const onCancel = mockAddEventListener.mock.calls[1][1];

      onCancel();
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

  describe('import tags', () => {
    it('should call the api and show success alert', async () => {
      jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
      jest.spyOn(window, 'alert').mockImplementation(() => {});

      const promise = importTaxonomyTags(1, intl).then(() => {
        expect(importTags).toHaveBeenCalledWith(1, 'mockFile');
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

    it('should abort the call to the api without file', async () => {
      const promise = importTaxonomyTags(1, intl).then(() => {
        expect(importTags).not.toHaveBeenCalled();
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

    it('should abort the call to the api if file closed', async () => {
      const promise = importTaxonomyTags(1, intl).then(() => {
        expect(importTags).not.toHaveBeenCalled();
      });

      // Capture the onCancel handler from the file input element
      const onCancel = mockAddEventListener.mock.calls[1][1];

      onCancel();
      return promise;
    });

    it('should abort the call to the api when cancel the confirm dialog', async () => {
      jest.spyOn(window, 'confirm').mockReturnValueOnce(null);

      const promise = importTaxonomyTags(1, intl).then(() => {
        expect(importTags).not.toHaveBeenCalled();
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
      jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
      importTags.mockRejectedValue(new Error('test error'));

      const promise = importTaxonomyTags(1, intl).then(() => {
        expect(importTags).toHaveBeenCalledWith(1, 'mockFile');
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
});

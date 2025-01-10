import { getConfig } from '@edx/frontend-platform';

import {
  render,
  initializeMocks,
  waitFor,
} from '../testUtils';
import AdvancedEditor from './AdvancedEditor';

jest.mock('./containers/EditorContainer', () => ({
  EditorModalWrapper: jest.fn(() => (<div>Advanced Editor Iframe</div>)),
}));
const onCloseMock = jest.fn();

describe('AdvancedEditor', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should call onClose when receiving "cancel-clicked" message', () => {
    render(<AdvancedEditor usageKey="test" onClose={onCloseMock} />);

    const messageEvent = new MessageEvent('message', {
      data: 'cancel-clicked',
      origin: getConfig().STUDIO_BASE_URL,
    });

    window.dispatchEvent(messageEvent);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should call onClose when receiving "save-clicked" message', () => {
    render(<AdvancedEditor usageKey="test" onClose={onCloseMock} />);

    const messageEvent = new MessageEvent('message', {
      data: 'save-end',
      origin: getConfig().STUDIO_BASE_URL,
    });

    window.dispatchEvent(messageEvent);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should call showToast when receiving "error" message', async () => {
    const { mockShowToast } = initializeMocks();

    render(<AdvancedEditor usageKey="test" onClose={onCloseMock} />);

    const messageEvent = new MessageEvent('message', {
      data: 'error',
      origin: getConfig().STUDIO_BASE_URL,
    });

    window.dispatchEvent(messageEvent);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalled();
    });
  });

  it('should not call onClose if the message is from an invalid origin', () => {
    render(<AdvancedEditor usageKey="test" onClose={onCloseMock} />);

    const messageEvent = new MessageEvent('message', {
      data: 'cancel-clicked',
      origin: 'https://invalid-origin.com',
    });

    window.dispatchEvent(messageEvent);

    expect(onCloseMock).not.toHaveBeenCalled();
  });
});

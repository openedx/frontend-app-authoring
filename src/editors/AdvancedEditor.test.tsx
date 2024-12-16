import { getConfig } from '@edx/frontend-platform';

import {
  render,
  initializeMocks,
} from '../testUtils';
import AdvancedEditor from './AdvancedEditor';

jest.mock('./containers/EditorContainer', () => ({
  EditorModalWrapper: jest.fn(() => (<div>Advanced Editor Iframe</div>)),
}));

describe('AdvancedEditor', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should call onClose when receiving "cancel-clicked" message', () => {
    const onCloseMock = jest.fn();

    render(<AdvancedEditor usageKey="test" onClose={onCloseMock} />);

    const messageEvent = new MessageEvent('message', {
      data: 'cancel-clicked',
      origin: getConfig().STUDIO_BASE_URL,
    });

    window.dispatchEvent(messageEvent);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should call onClose when receiving "save-clicked" message', () => {
    const onCloseMock = jest.fn();

    render(<AdvancedEditor usageKey="test" onClose={onCloseMock} />);

    const messageEvent = new MessageEvent('message', {
      data: 'save-clicked',
      origin: getConfig().STUDIO_BASE_URL,
    });

    window.dispatchEvent(messageEvent);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should not call onClose if the message is from an invalid origin', () => {
    const onCloseMock = jest.fn();

    render(<AdvancedEditor usageKey="test" onClose={onCloseMock} />);

    const messageEvent = new MessageEvent('message', {
      data: 'cancel-clicked',
      origin: 'https://invalid-origin.com',
    });

    window.dispatchEvent(messageEvent);

    expect(onCloseMock).not.toHaveBeenCalled();
  });
});

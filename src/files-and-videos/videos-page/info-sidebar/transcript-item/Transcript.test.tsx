import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import Transcript from './Transcript';

describe('Transcript (new, empty row)', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('opens the file picker once a language is chosen for the new transcript', () => {
    const clickSpy = jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    render(
      <Transcript
        languages={{ ar: 'Arabic', en: 'English' }}
        transcript=""
        previousSelection={['']}
        handleTranscript={jest.fn()}
        video={{ id: 'vid-1', displayName: 'My Video' }}
        transcriptSettings={{
          transcriptDownloadHandlerUrl: '/transcript_download/',
          transcriptUploadHandlerUrl: '/transcript_upload/',
        }}
      />,
    );

    fireEvent.click(screen.getByTestId('language-select-dropdown'));
    fireEvent.click(screen.getByText('Arabic'));
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});

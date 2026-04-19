import MockAdapter from 'axios-mock-adapter';
import { initializeMocks } from '@src/testUtils';
import PdfEditor from '@src/editors/containers/PdfEditor/index';
import { editorRender } from '@src/editors/editorTestRender';
import { initialPdfState, PdfState } from '@src/editors/containers/PdfEditor/contexts';
import messages from '@src/editors/containers/PdfEditor/components/messages';
import downloadMessages from '@src/editors/containers/PdfEditor/components/sections/messages';
import uploadMessages from '@src/editors/sharedComponents/UploadWidget/messages';
import editorMessages from '@src/editors/containers/EditorContainer/messages';
import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const render = () =>
  editorRender(
    <PdfEditor onClose={() => undefined} returnFunction={() => () => undefined} />,
    {
      initialState: {
        app: {
          blockValue: {
            data: {
              id: 'pdf-block-id',
              display_name: 'PDF',
              category: 'pdf',
              has_children: false,
              has_changes: null,
              explanatory_message: null,
              group_access: {},
              data: '',
              metadata: {
                display_name: 'PDF',
              },
            },
          },
          unitUrl: {
            data: {
              ancestors: [
                {
                  id: 'block-v1:Test+TS102+2026+type@vertical+block@29f73003508e47e0af00b495ecdc66f1',
                  display_name: 'Unit',
                  category: 'vertical',
                  has_children: true,
                },
                {
                  id: 'block-v1:Test+TS102+2026+type@sequential+block@a9f3bc6ad94a4e108449b5c84a46f7ba',
                  display_name: 'Subsection',
                  category: 'sequential',
                  has_children: true,
                },
                {
                  id: 'block-v1:Test+TS102+2026+type@chapter+block@606d3cab05a94551b71c5abbd0009baf',
                  display_name: 'Section',
                  category: 'chapter',
                  has_children: true,
                },
                {
                  id: 'block-v1:Test+TS102+2026+type@course+block@course',
                  display_name: 'New Test Course',
                  category: 'course',
                  has_children: true,
                  unit_level_discussions: true,
                },
              ],
            },
          },
          blockId: 'pdf-block-id',
          blockTitle: 'PDF',
          blockType: 'pdf',
          learningContextId: 'course-v1:Test+TS102+2026',
          editorInitialized: false,
          studioEndpointUrl: 'https://studio.local',
          lmsEndpointUrl: 'http://local.openedx.io:8000',
          images: {},
          imageCount: 0,
          videos: {},
          courseDetails: {},
          showRawEditor: false,
        },
      },
    },
  );

describe('PdfEditor', () => {
  let axiosMock: MockAdapter;
  beforeEach(() => {
    axiosMock = initializeMocks().axiosMock;
  });

  const setBlock = (state?: Partial<PdfState>) => {
    axiosMock.onGet(
      'https://studio.local/xblock/pdf-block-id/handler/load_pdf',
    ).reply(200, { ...initialPdfState(), url: 'https://example.com/example.pdf', ...state });
  };

  it('fetches a block and renders.', async () => {
    // Slightly different loader to show spinner.
    axiosMock.onGet(
      'https://studio.local/xblock/pdf-block-id/handler/load_pdf',
    ).withDelayInMs(200).reply(200, initialPdfState());
    const screen = render();
    screen.getByText(messages.blockLoading.defaultMessage);
    // And then should show the block.
    await waitFor(() => screen.getByText(downloadMessages.allowDownloadLabel.defaultMessage));
  });
  it('handles failure gracefully.', async () => {
    axiosMock.onGet(
      'https://studio.local/xblock/pdf-block-id/handler/load_pdf',
    ).reply(500, {});
    const screen = render();
    await waitFor(() => screen.getByText(messages.blockFailed.defaultMessage));
  });
  it('hides the download options if downloads are universally disabled', async () => {
    setBlock({ disableAllDownload: true });
    const screen = render();
    await waitFor(() => screen.getByText(uploadMessages.courseFileHint.defaultMessage));
    expect(screen.queryAllByLabelText(downloadMessages.allowDownloadLabel.defaultMessage)).toEqual([]);
  });
  it('submits changes to the cms', async () => {
    axiosMock.onPost('https://studio.local/xblock/pdf-block-id').reply(200, {
      data: {
        id: 'pdf-block-id',
        data: null,
        metadata: {
          display_name: 'PDF',
        },
      },
    });
    const user = userEvent.setup();
    setBlock();
    const screen = render();
    await waitFor(() => screen.getByText(uploadMessages.courseFileHint.defaultMessage));
    const dropdown = screen.getByLabelText(uploadMessages.actionsDropdown.defaultMessage);
    await user.click(dropdown);
    const toggle = await waitFor(() => screen.getByText(uploadMessages.manualUrl.defaultMessage));
    await user.click(toggle);
    const field = await waitFor(() => screen.getByLabelText(uploadMessages.urlFieldLabel.defaultMessage));
    fireEvent.change(field, { target: { value: 'https://somewhere.com/stuff.pdf' } });
    const saveButton = screen.getByLabelText(editorMessages.saveButtonAriaLabel.defaultMessage);
    await user.click(saveButton);
    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual('https://studio.local/xblock/pdf-block-id'));
    const request = axiosMock.history.post[0];
    expect(JSON.parse(request.data).metadata.url).toEqual('https://somewhere.com/stuff.pdf');
  });
});

import MockAdapter from 'axios-mock-adapter';
import { initializeMocks } from '@src/testUtils';
import PdfEditor from '@src/editors/containers/PdfEditor/index';
import { editorRender, EditorRenderState } from '@src/editors/editorTestRender';
import { initialPdfState, PdfState } from '@src/editors/containers/PdfEditor/contexts';
import messages from '@src/editors/containers/PdfEditor/components/messages';
import downloadMessages from '@src/editors/containers/PdfEditor/components/sections/messages';
import uploadMessages from '@src/editors/sharedComponents/UploadWidget/messages';
import editorMessages from '@src/editors/containers/EditorContainer/messages';
import { fireEvent, RenderResult, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import fileMessage from '@src/files-and-videos/generic/messages';

const reduxState = () => (
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
                id: 'block-v1:course-v1:Org+COURSE+RUN+type@vertical+block@29f73003508e47e0af00b495ecdc66f1',
                display_name: 'Unit',
                category: 'vertical',
                has_children: true,
              },
              {
                id: 'block-v1:course-v1:Org+COURSE+RUN+type@sequential+block@a9f3bc6ad94a4e108449b5c84a46f7ba',
                display_name: 'Subsection',
                category: 'sequential',
                has_children: true,
              },
              {
                id: 'block-v1:course-v1:Org+COURSE+RUN+type@chapter+block@606d3cab05a94551b71c5abbd0009baf',
                display_name: 'Section',
                category: 'chapter',
                has_children: true,
              },
              {
                id: 'block-v1:course-v1:Org+COURSE+RUN+type@course+block@course',
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
        learningContextId: 'course-v1:Org+COURSE+RUN',
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
  } as EditorRenderState
);

const render = (state?: Partial<EditorRenderState>) =>
  editorRender(
    <PdfEditor onClose={() => undefined} returnFunction={() => () => undefined} />,
    { ...reduxState(), ...state },
  );

describe('PdfEditor', () => {
  let axiosMock: MockAdapter;
  beforeEach(() => {
    axiosMock = initializeMocks().axiosMock;
  });

  const setBlock = (state?: Partial<PdfState>, blockId: string = 'pdf-block-id') => {
    axiosMock.onGet(
      `https://studio.local/xblock/${blockId}/handler/load_pdf`,
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

  const prepForUpload = async (screen: RenderResult, user: UserEvent): Promise<HTMLElement> => {
    const dropdown = screen.getByLabelText(uploadMessages.actionsDropdown.defaultMessage);
    const input = screen.getByLabelText(fileMessage.fileInputAriaLabel.defaultMessage);
    const spy = jest.spyOn(input, 'click');
    await user.click(dropdown);
    await user.click(screen.getByText(uploadMessages.replaceFile.defaultMessage));
    await waitFor(() => expect(spy).toHaveBeenCalled());
    return input;
  };

  it('Handles a PDF without triggering autoconversion', async () => {
    axiosMock.onPost('https://studio.local/assets/course-v1:Org+COURSE+RUN/').withDelayInMs(500).reply(
      201,
      {
        asset: {
          external_url: 'https://studio.local/asset-v1:course-v1:Org+COURSE+RUN+type@asset+block@my-test-doc.pdf',
        },
      },
    );
    const user = userEvent.setup();
    setBlock({ conversionAvailable: true });
    const screen = render();
    await waitFor(() => screen.getByText(uploadMessages.courseFileHint.defaultMessage));
    const input = await prepForUpload(screen, user);
    await user.upload(
      input,
      new File(
        ['beep'],
        'my-test-doc.pdf',
        { type: 'application/pdf' },
      ),
    );
    await waitFor(() => screen.getByText(uploadMessages.uploading.defaultMessage));
    await waitFor(() => screen.getByText('my-test-doc.pdf'));
  });
  it('Autoconverts in courses', async () => {
    axiosMock.onPost('https://studio.local/assets/course-v1:Org+COURSE+RUN/').withDelayInMs(500).reply(
      201,
      {
        asset: {
          external_url: 'https://studio.local/asset-v1:course-v1:Org+COURSE+RUN+type@asset+block@my-test-doc.docx',
        },
      },
    );
    axiosMock.onPost(
      'https://studio.local/xblock/pdf-block-id/handler/convert_pdf',
    ).withDelayInMs(200).reply(200, { url: 'https://example.com/path/to/revised.pdf' });
    const user = userEvent.setup();
    setBlock({ conversionAvailable: true });
    const screen = render();
    await waitFor(() => screen.getByText(uploadMessages.courseFileHint.defaultMessage));
    const input = await prepForUpload(screen, user);
    await user.upload(
      input,
      new File(
        ['beep'],
        'my-test-doc.docx',
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      ),
    );
    await waitFor(() => screen.getByText(uploadMessages.uploading.defaultMessage));
    await waitFor(() => screen.getByText('revised.pdf'));
    screen.getByDisplayValue(
      'https://studio.local/asset-v1:course-v1:Org+COURSE+RUN+type@asset+block@my-test-doc.docx',
    );
  });
  it('Autoconverts in libraries', async () => {
    axiosMock.onPut(
      'http://localhost:18010/api/libraries/v2/blocks/lb:Test:TL100:pdf:pdf-block/assets/static/my-test-doc.docx',
    )
      .withDelayInMs(500).reply(
        201,
        {
          path: 'static/my-test-doc.docx',
        },
      );
    axiosMock.onGet(
      'https://studio.local/api/xblock/v2/xblocks/lb:Test:TL100:pdf:pdf-block/handler_url/load_pdf/',
    ).reply(
      200,
      { handler_url: 'https://studio.local/xblock/resolved_handler/lb:Test:TL100:pdf:pdf-block/handler/load_pdf' },
    );
    axiosMock.onGet(
      'https://studio.local/api/xblock/v2/xblocks/lb:Test:TL100:pdf:pdf-block/handler_url/convert_pdf/',
    ).reply(
      200,
      { handler_url: 'https://studio.local/xblock/resolved_handler/lb:Test:TL100:pdf:pdf-block/handler/convert_pdf' },
    );
    axiosMock.onPost(
      'https://studio.local/xblock/resolved_handler/lb:Test:TL100:pdf:pdf-block/handler/convert_pdf',
    ).withDelayInMs(200).reply(200, { url: '/static/revised.pdf' });
    const user = userEvent.setup();
    setBlock({ conversionAvailable: true }, 'resolved_handler/lb:Test:TL100:pdf:pdf-block');
    const loadedState = reduxState();
    loadedState.learningContextId = 'lib:Test:TL100';
    loadedState.initialState!.app!.blockId = 'lb:Test:TL100:pdf:pdf-block';
    const screen = render(loadedState);
    await waitFor(() => screen.getByText(uploadMessages.libraryFileHint.defaultMessage));
    const input = await prepForUpload(screen, user);
    await user.upload(
      input,
      new File(
        ['beep'],
        'my-test-doc.docx',
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      ),
    );
    await waitFor(() => screen.getByText(uploadMessages.uploading.defaultMessage));
    await waitFor(() => screen.getByText('revised.pdf'));
    screen.getByDisplayValue('/static/my-test-doc.docx');
  });
});

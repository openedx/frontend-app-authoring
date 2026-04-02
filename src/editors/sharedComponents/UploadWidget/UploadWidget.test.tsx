import { UploadWidgetProps } from '@src/editors/sharedComponents/UploadWidget/UploadWidget';
import { UploadWidget } from '@src/editors/sharedComponents/UploadWidget/index';
import { Formik, FormikConfig } from 'formik';
import { initializeMocks } from '@src/testUtils';
import { editorRender } from '@src/editors/editorTestRender';
import fileMessage from '@src/files-and-videos/generic/messages';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { waitFor } from '@testing-library/react';
import messages from './messages';

declare type UploadForm = FormikConfig<{ url: string }>;

declare interface RenderOpts {
  props: UploadWidgetProps,
  formikProps: UploadForm,
}

const defaultProps: (overrides?: Partial<UploadWidgetProps>) => UploadWidgetProps = (overrides) => ({
  id: 'pdf-url',
  label: 'file',
  supportedFileFormats: ['application/pdf'],
  urlFieldName: 'url',
  blockId: 'pdf-block',
  isLibrary: false,
  ...overrides,
});

const defaultFormikProps: (overrides?: Partial<UploadForm>) => UploadForm = (overrides) => ({
  initialValues: { url: 'http://example.com/example.pdf' },
  onSubmit: jest.fn(),
  ...overrides,
});

const renderWidget = ({ props, formikProps }: RenderOpts) => editorRender(
  <Formik {...formikProps}>
    <UploadWidget {...props} />
  </Formik>,
  { initialState: { app: { studioEndpointUrl: 'https://studio.local' } } },
);

describe('UploadWidget', () => {
  let axiosMock: MockAdapter;
  beforeEach(() => {
    axiosMock = initializeMocks().axiosMock;
  });
  it('renders', () => {
    const screen = renderWidget({ props: defaultProps(), formikProps: defaultFormikProps() });
    screen.getByText(messages.courseFileHint.defaultMessage);
  });
  it('handles a file upload in a course.', async () => {
    const user = userEvent.setup();
    axiosMock.onPost('https://studio.local/assets/course-v1:Org+COURSE+RUN/').withDelayInMs(1000).reply(
      201,
      {
        asset: {
          external_url: 'https://studio.local/asset-v1:course-v1:Org+COURSE+RUN+type@asset+block@my-saved-pdf.pdf',
        },
      },
    );
    const screen = renderWidget({ props: defaultProps(), formikProps: defaultFormikProps() });
    const dropdown = screen.getByLabelText(messages.actionsDropdown.defaultMessage);
    screen.getByText(messages.courseFileHint.defaultMessage);
    const input = screen.getByLabelText(fileMessage.fileInputAriaLabel.defaultMessage);
    const spy = jest.spyOn(input, 'click');
    await user.click(dropdown);
    await user.click(screen.getByText(messages.replaceFile.defaultMessage));
    await waitFor(() => expect(spy).toHaveBeenCalled());
    await user.upload(input, new File(['beep'], 'my-test-pdf.pdf', { type: 'application/pdf' }));
    await waitFor(() => screen.getByText(messages.uploading.defaultMessage));
    await waitFor(() => screen.getByText('my-saved-pdf.pdf'));
  });
  it('handles a file upload in a library.', async () => {
    const user = userEvent.setup();
    axiosMock.onPut('http://localhost:18010/api/libraries/v2/blocks/pdf-block/assets/static/my-test-pdf.pdf').withDelayInMs(1000).reply(
      201,
      {
        url: 'https://studio.local/asset-v1:course-v1:Org+COURSE+RUN+type@asset+block@my-saved-pdf.pdf',
      },
    );
    const screen = renderWidget({ props: defaultProps({ isLibrary: true }), formikProps: defaultFormikProps() });
    const dropdown = screen.getByLabelText(messages.actionsDropdown.defaultMessage);
    screen.getByText(messages.libraryFileHint.defaultMessage);
    const input = screen.getByLabelText(fileMessage.fileInputAriaLabel.defaultMessage);
    const spy = jest.spyOn(input, 'click');
    await user.click(dropdown);
    await user.click(screen.getByText(messages.replaceFile.defaultMessage));
    await waitFor(() => expect(spy).toHaveBeenCalled());
    await user.upload(input, new File(['beep'], 'my-test-pdf.pdf', { type: 'application/pdf' }));
    await waitFor(() => screen.getByText(messages.uploading.defaultMessage));
    await waitFor(() => screen.getByText('my-saved-pdf.pdf'));
  });
  it('displays a useful error if the file is too large.', async () => {
    const user = userEvent.setup();
    const screen = renderWidget({ props: defaultProps(), formikProps: defaultFormikProps() });
    expect(screen.queryAllByText(messages.fileTooLarge.defaultMessage)).toEqual([]);
    const input = screen.getByLabelText(fileMessage.fileInputAriaLabel.defaultMessage);
    await user.upload(input, new File(['a'.repeat(20_000_001)], 'my-test-pdf.pdf', { type: 'application/pdf' }));
    await waitFor(() => screen.getByText(messages.fileTooLarge.defaultMessage));
  });
  it('displays a useful error if the upload fails.', async () => {
    const user = userEvent.setup();
    axiosMock.onPost('https://studio.local/assets/course-v1:Org+COURSE+RUN/').reply(400, {});
    const screen = renderWidget({ props: defaultProps(), formikProps: defaultFormikProps() });
    const input = screen.getByLabelText(fileMessage.fileInputAriaLabel.defaultMessage);
    await user.upload(input, new File(['beep'], 'my-test-pdf.pdf', { type: 'application/pdf' }));
    await waitFor(() => screen.getByText(messages.uploadError.defaultMessage));
  });
  it('displays a useful message when the block needs to be saved before you can upload', async () => {
    const screen = renderWidget({ props: defaultProps({ blockId: '' }), formikProps: defaultFormikProps() });
    screen.getByText(messages.blockCreationWarning.defaultMessage);
  });
  it('switches to manual mode and back.', async () => {
    const user = userEvent.setup();
    const screen = renderWidget({ props: defaultProps(), formikProps: defaultFormikProps() });
    // Manual URL shouldn't be visible now.
    expect(screen.queryAllByDisplayValue('http://example.com/example.pdf')).toEqual([]);
    // But filename display should be.
    screen.getByText('example.pdf');
    const dropdown = screen.getByLabelText(messages.actionsDropdown.defaultMessage);
    await user.click(dropdown);
    const toggle = await waitFor(() => screen.getByText(messages.manualUrl.defaultMessage));
    await user.click(toggle);
    // Should be able to see the input now.
    await waitFor(() => screen.getByDisplayValue('http://example.com/example.pdf'));
    const simpleButton = screen.getByText(messages.simpleMode.defaultMessage);
    await user.click(simpleButton);
    // And gone again.
    await waitFor(() => expect(screen.queryAllByDisplayValue('http://example.com/example.pdf')).toEqual([]));
    screen.getByText('example.pdf');
  });
  it('provides a sensible default name for an unidentified item', () => {
    const screen = renderWidget({
      props: defaultProps(),
      formikProps: defaultFormikProps({ initialValues: { url: 'http://example.com///' } }),
    });
    screen.getByText(messages.defaultName.defaultMessage);
  });
  it('provides a sensible message when the file field is blank', () => {
    const screen = renderWidget({
      props: defaultProps(),
      formikProps: defaultFormikProps({ initialValues: { url: '' } }),
    });
    screen.getByText(messages.emptyLabel.defaultMessage);
  });
});

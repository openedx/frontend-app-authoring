// These additional mocks and setup are required for some tests in src/editors/
// and are imported on an as-needed basis.

// /////////////////////////////////////////////////////////////////////////////
// TODO: tests using this 'setupEditorTest', shallow rendering, and snapshots
// should be replaced with modern tests that use src/testUtils.ts and
// @testing-library/react. See
//   src/editors/containers/ProblemEditor/components/SelectTypeModal/index.test.tsx
// for an example of an editor test in the new format.
// /////////////////////////////////////////////////////////////////////////////

import { formatMessage as mockFormatMessage } from './testUtils';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'jest-canvas-mock';

jest.mock('@edx/frontend-platform/i18n', () => {
  const i18n = jest.requireActual('@edx/frontend-platform/i18n');
  const PropTypes = jest.requireActual('prop-types');
  return {
    ...i18n,
    useIntl: () => ({ formatMessage: mockFormatMessage }),
    intlShape: PropTypes.shape({
      formatMessage: PropTypes.func,
    }),
    defineMessages: m => m,
    getLocale: () => 'getLocale',
    FormattedDate: () => 'FormattedDate',
    FormattedMessage: () => 'FormattedMessage',
    FormattedTime: () => 'FormattedTime',
  };
});

jest.mock('@openedx/paragon', () => jest.requireActual('./testUtils').mockNestedComponents({
  Alert: {
    Heading: 'Alert.Heading',
  },
  AlertModal: 'AlertModal',
  ActionRow: {
    Spacer: 'ActionRow.Spacer',
  },
  Badge: 'Badge',
  Button: 'Button',
  ButtonGroup: 'ButtonGroup',
  Collapsible: {
    Advanced: 'Advanced',
    Body: 'Body',
    Trigger: 'Trigger',
    Visible: 'Visible',
  },
  Card: {
    Header: 'Card.Header',
    Section: 'Card.Section',
    Footer: 'Card.Footer',
    Body: 'Card.Body',
  },
  CheckboxControl: 'CheckboxControl',
  Col: 'Col',
  Container: 'Container',
  Dropdown: {
    Item: 'Dropdown.Item',
    Menu: 'Dropdown.Menu',
    Toggle: 'Dropdown.Toggle',
  },
  ErrorContext: {
    Provider: 'ErrorContext.Provider',
  },
  Hyperlink: 'Hyperlink',
  Icon: 'Icon',
  IconButton: 'IconButton',
  IconButtonWithTooltip: 'IconButtonWithTooltip',
  Image: 'Image',
  MailtoLink: 'MailtoLink',
  ModalDialog: {
    Footer: 'ModalDialog.Footer',
    Header: 'ModalDialog.Header',
    Title: 'ModalDialog.Title',
    Body: 'ModalDialog.Body',
    CloseButton: 'ModalDialog.CloseButton',
  },
  Form: {
    Checkbox: 'Form.Checkbox',
    Control: {
      Feedback: 'Form.Control.Feedback',
    },
    Group: 'Form.Group',
    Label: 'Form.Label',
    Text: 'Form.Text',
    Row: 'Form.Row',
    Radio: 'Radio',
    RadioSet: 'RadioSet',
  },
  OverlayTrigger: 'OverlayTrigger',
  Tooltip: 'Tooltip',
  FullscreenModal: 'FullscreenModal',
  Row: 'Row',
  Scrollable: 'Scrollable',
  SelectableBox: {
    Set: 'SelectableBox.Set',
  },

  Spinner: 'Spinner',
  Stack: 'Stack',
  Toast: 'Toast',
  Truncate: 'Truncate',
  useWindowSize: { height: '500px' },
}));

jest.mock('@openedx/paragon/icons', () => ({
  Close: jest.fn().mockName('icons.Close'),
  Edit: jest.fn().mockName('icons.Edit'),
  Locked: jest.fn().mockName('icons.Locked'),
  Unlocked: jest.fn().mockName('icons.Unlocked'),
}));

// Mock react-redux hooks
// unmock for integration tests
jest.mock('react-redux', () => {
  const dispatch = jest.fn((...args) => ({ dispatch: args })).mockName('react-redux.dispatch');
  return {
    connect: (mapStateToProps, mapDispatchToProps) => (component) => ({
      mapStateToProps,
      mapDispatchToProps,
      component,
    }),
    useDispatch: jest.fn(() => dispatch),
    useSelector: jest.fn((selector) => ({ useSelector: selector })),
  };
});

// Mock the plugins repo so jest will stop complaining about ES6 syntax
jest.mock('frontend-components-tinymce-advanced-plugins', () => ({
  a11ycheckerCss: '',
}));

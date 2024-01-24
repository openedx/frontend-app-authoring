/* eslint-disable import/no-extraneous-dependencies */

import 'babel-polyfill';
import 'jest-canvas-mock';

/* need to mock window for tinymce on import, as it is JSDOM incompatible */

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// These configuration values are usually set in webpack's EnvironmentPlugin however
// Jest does not use webpack so we need to set these so for testing
process.env.ACCESS_TOKEN_COOKIE_NAME = 'edx-jwt-cookie-header-payload';
process.env.BASE_URL = 'localhost:1995';
process.env.CREDENTIALS_BASE_URL = 'http://localhost:18150';
process.env.CSRF_TOKEN_API_PATH = '/csrf/api/v1/token';
process.env.ECOMMERCE_BASE_URL = 'http://localhost:18130';
process.env.LANGUAGE_PREFERENCE_COOKIE_NAME = 'openedx-language-preference';
process.env.LMS_BASE_URL = 'http://localhost:18000';
process.env.LOGIN_URL = 'http://localhost:18000/login';
process.env.LOGOUT_URL = 'http://localhost:18000/login';
process.env.MARKETING_SITE_BASE_URL = 'http://localhost:18000';
process.env.ORDER_HISTORY_URL = 'localhost:1996/orders';
process.env.REFRESH_ACCESS_TOKEN_ENDPOINT = 'http://localhost:18000/login_refresh';
process.env.SEGMENT_KEY = 'segment_whoa';
process.env.SITE_NAME = 'edX';
process.env.USER_INFO_COOKIE_NAME = 'edx-user-info';
process.env.LOGO_URL = 'https://edx-cdn.org/v3/default/logo.svg';
process.env.LOGO_TRADEMARK_URL = 'https://edx-cdn.org/v3/default/logo-trademark.svg';
process.env.LOGO_WHITE_URL = 'https://edx-cdn.org/v3/default/logo-white.svg';
process.env.FAVICON_URL = 'https://edx-cdn.org/v3/default/favicon.ico';

jest.mock('@edx/frontend-platform/i18n', () => {
  const i18n = jest.requireActual('@edx/frontend-platform/i18n');
  const PropTypes = jest.requireActual('prop-types');
  return {
    ...i18n,
    intlShape: PropTypes.shape({
      formatMessage: PropTypes.func,
    }),
    defineMessages: m => m,
    FormattedDate: () => 'FormattedDate',
    FormattedMessage: () => 'FormattedMessage',
    FormattedTime: () => 'FormattedTime',
  };
});

jest.mock('@edx/paragon', () => jest.requireActual('testUtils').mockNestedComponents({
  Alert: {
    Heading: 'Alert.Heading',
  },
  ActionRow: {
    Spacer: 'ActionRow.Spacer',
  },
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
}));

jest.mock('@edx/paragon/icons', () => ({
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

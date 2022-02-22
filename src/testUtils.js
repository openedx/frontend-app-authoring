/**
 * Mocked formatMessage provided by react-intl
 */
export const formatMessage = (msg, values) => {
  let message = msg.defaultMessage;
  if (values === undefined) {
    return message;
  }
  Object.keys(values).forEach((key) => {
    // eslint-disable-next-line
    message = message.replace(`{${key}}`, values[key]);
  });
  return message;
};

/**
 * Mock a single component, or a nested component so that its children render nicely
 * in snapshots.
 * @param {string} name - parent component name
 * @param {obj} contents - object of child components with intended component
 *   render name.
 * @return {func} - mock component with nested children.
 *
 * usage:
 *   mockNestedComponent('Card', { Body: 'Card.Body', Form: { Control: { Feedback: 'Form.Control.Feedback' }}... });
 *   mockNestedComponent('IconButton', 'IconButton');
 */
export const mockNestedComponent = (name, contents) => {
  if (typeof contents !== 'object') {
    return contents;
  }
  const fn = () => name;
  Object.defineProperty(fn, 'name', { value: name });
  Object.keys(contents).forEach((nestedName) => {
    const value = contents[nestedName];
    fn[nestedName] = typeof value !== 'object'
      ? value
      : mockNestedComponent(`${name}.${nestedName}`, value);
  });
  return fn;
};

/**
 * Mock a module of components.  nested components will be rendered nicely in snapshots.
 * @param {obj} mapping - component module mock config.
 * @return {obj} - module of flat and nested components that will render nicely in snapshots.
 * usage:
 *   mockNestedComponents({
 *     Card: { Body: 'Card.Body' },
 *     IconButton: 'IconButton',
 *   })
 */
export const mockNestedComponents = (mapping) => Object.entries(mapping).reduce(
  (obj, [name, value]) => ({
    ...obj,
    [name]: mockNestedComponent(name, value),
  }),
  {},
);

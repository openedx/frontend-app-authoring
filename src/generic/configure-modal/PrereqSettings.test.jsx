import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Formik } from 'formik';

import PrereqSettings from './PrereqSettings';
import messages from './messages';

const prereqs = [
  { blockUsageKey: 'block-v1:prereq+1', blockDisplayName: 'Prerequisite 1' },
];

const defaultValues = {
  isPrereq: false,
  prereqUsageKey: '',
  prereqMinScore: 100,
  prereqMinCompletion: 100,
};

const renderComponent = (props = {}) => {
  const values = { ...defaultValues, ...props.values };
  return render(
    <IntlProvider locale="en">
      <Formik initialValues={values} onSubmit={() => {}}>
        <PrereqSettings
          values={values}
          setFieldValue={props.setFieldValue ?? jest.fn()}
          prereqs={props.prereqs ?? prereqs}
          {...('readOnly' in props ? { readOnly: props.readOnly } : {})}
        />
      </Formik>
    </IntlProvider>,
  );
};

describe('<PrereqSettings />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isPrereq is undefined', () => {
    const { container } = renderComponent({ values: { isPrereq: undefined } });
    expect(container).toBeEmptyDOMElement();
  });

  describe('readOnly prop', () => {
    it('leaves the prerequisite checkbox and select enabled by default (readOnly defaults to false)', () => {
      // readOnly is intentionally omitted to exercise the default value.
      renderComponent();

      expect(
        screen.getByRole('checkbox', { name: messages.prereqCheckboxLabel.defaultMessage }),
      ).not.toBeDisabled();
      expect(
        screen.getByRole('combobox', { name: messages.prerequisiteSelectLabel.defaultMessage }),
      ).not.toBeDisabled();
    });

    it('disables the prerequisite checkbox and select when readOnly is true', () => {
      renderComponent({ readOnly: true });

      expect(
        screen.getByRole('checkbox', { name: messages.prereqCheckboxLabel.defaultMessage }),
      ).toBeDisabled();
      expect(
        screen.getByRole('combobox', { name: messages.prerequisiteSelectLabel.defaultMessage }),
      ).toBeDisabled();
    });

    it('disables the min score and completion inputs when readOnly is true', () => {
      renderComponent({
        readOnly: true,
        values: { prereqUsageKey: 'block-v1:prereq+1' },
      });

      const spinbuttons = screen.getAllByRole('spinbutton');
      expect(spinbuttons).toHaveLength(2);
      spinbuttons.forEach((input) => expect(input).toBeDisabled());
    });

    it('leaves the min score and completion inputs enabled when readOnly is false', () => {
      renderComponent({
        readOnly: false,
        values: { prereqUsageKey: 'block-v1:prereq+1' },
      });

      const spinbuttons = screen.getAllByRole('spinbutton');
      expect(spinbuttons).toHaveLength(2);
      spinbuttons.forEach((input) => expect(input).not.toBeDisabled());
    });

    it('does not fire setFieldValue when the disabled checkbox is clicked', async () => {
      const user = userEvent.setup();
      const setFieldValue = jest.fn();
      renderComponent({ readOnly: true, setFieldValue });

      await user.click(
        screen.getByRole('checkbox', { name: messages.prereqCheckboxLabel.defaultMessage }),
      );

      expect(setFieldValue).not.toHaveBeenCalled();
    });
  });
});

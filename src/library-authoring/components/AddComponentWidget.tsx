import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import {
  AddCircleOutline,
  CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@openedx/paragon/icons';

import { useComponentPickerContext } from '../common/context/ComponentPickerContext';
import messages from './messages';

interface AddComponentWidgetProps {
  usageKey: string;
  blockType: string;
}

const AddComponentWidget = ({ usageKey, blockType }: AddComponentWidgetProps) => {
  const intl = useIntl();

  const {
    componentPickerMode,
    onComponentSelected,
    addComponentToSelectedComponents,
    removeComponentFromSelectedComponents,
    selectedComponents,
    isLoading,
    setIsLoading,
  } = useComponentPickerContext();

  // istanbul ignore if: this should never happen
  if (!usageKey) {
    throw new Error('usageKey is required');
  }

  // istanbul ignore if: this should never happen
  if (!componentPickerMode) {
    return null;
  }

  /** disables button while the onComponentSelected operation is pending */
  const onClick = async () => {
    setIsLoading?.(true);
    try {
      await onComponentSelected?.({ usageKey, blockType });
    } finally {
      setIsLoading?.(false);
    }
  };

  if (componentPickerMode === 'single') {
    return (
      <Button
        variant="outline-primary"
        iconBefore={AddCircleOutline}
        disabled={isLoading}
        onClick={onClick}
      >
        <FormattedMessage {...messages.componentPickerSingleSelectTitle} />
      </Button>
    );
  }

  if (componentPickerMode === 'multiple') {
    const isChecked = selectedComponents.some((component) => component.usageKey === usageKey);

    const handleChange = () => {
      const selectedComponent = {
        usageKey,
        blockType,
      };
      if (!isChecked) {
        addComponentToSelectedComponents(selectedComponent);
      } else {
        removeComponentFromSelectedComponents(selectedComponent);
      }
    };

    return (
      <Button
        variant="outline-primary"
        iconBefore={isChecked ? CheckBoxIcon : CheckBoxOutlineBlank}
        onClick={handleChange}
      >
        {intl.formatMessage(messages.componentPickerMultipleSelectTitle)}
      </Button>
    );
  }

  // istanbul ignore next: this should never happen
  return null;
};

export default AddComponentWidget;

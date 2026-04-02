import { useContext, useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Dropdown,
  Form,
  Icon,
  Spinner,
  StandardModal,
} from '@openedx/paragon';
import { Add as AddIcon, ArrowDropDown as ArrowDropDownIcon } from '@openedx/paragon/icons';

import { ToastContext } from '@src/generic/toast-context';
import type { ComponentTemplate } from './data/api';
import { useCreateXBlockInUnit } from './data/hooks';
import messages from './messages';

/** Result returned after a component is created */
export interface CreatedXBlockInfo {
  locator: string;
  courseKey: string;
  type: string;
  category?: string;
}

interface AddComponentWidgetProps {
  /** Usage key of the parent unit (vertical) */
  unitId: string;
  /** Available component templates from the unit handler API */
  componentTemplates: ComponentTemplate[];
  /** Whether clipboard paste is available */
  showPasteXBlock?: boolean;
  /** Handler for pasting clipboard content into this unit */
  onPasteComponent?: () => void;
  /** Called after a component is created — receives creation info so caller can open the editor */
  onComponentCreated?: (info: CreatedXBlockInfo) => void;
}

/**
 * Dropdown button for adding a new component to a unit from the course outline.
 * Shows a template selection modal (radio buttons) when a component type has multiple templates.
 * After creation, returns the new block locator/courseKey/type via onComponentCreated callback.
 */
const AddComponentWidget = ({
  unitId,
  componentTemplates,
  showPasteXBlock = false,
  onPasteComponent,
  onComponentCreated,
}: AddComponentWidgetProps) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const { mutateAsync: createXBlock, isPending } = useCreateXBlockInUnit(unitId);

  // State for template selection modal – shown when a component type has multiple templates
  const [isModalOpen, setIsModalOpen] = useState(false);
  // The component template group currently being shown in the modal
  const [modalTemplate, setModalTemplate] = useState<ComponentTemplate | null>(null);
  // The selected radio value (boilerplateName or category) inside the modal
  const [selectedTemplateValue, setSelectedTemplateValue] = useState<string>('');

  /** Create the xblock and notify the parent with the result */
  const handleAddComponent = async (type: string, category?: string, boilerplate?: string) => {
    try {
      // POST to /xblock/ and receive the new block locator + courseKey
      const result = await createXBlock({
        parentLocator: unitId,
        type,
        category,
        boilerplate,
      });
      // Notify parent with creation info so it can refresh and open the editor
      onComponentCreated?.({
        locator: result.locator,
        courseKey: result.courseKey,
        type,
        category,
      });
    } catch {
      showToast(intl.formatMessage(messages.addComponentError));
    }
  };

  /** Handle clicking a dropdown item – open modal if multiple templates, otherwise create directly */
  const handleDropdownItemClick = async (template: ComponentTemplate) => {
    if (template.templates.length > 1) {
      // Multiple sub-types available – show selection modal
      setModalTemplate(template);
      setSelectedTemplateValue('');
      setIsModalOpen(true);
    } else {
      // Single template – create immediately
      const firstTemplate = template.templates[0];
      await handleAddComponent(
        template.type,
        firstTemplate?.category || template.type,
        firstTemplate?.boilerplateName,
      );
    }
  };

  /** Submit the modal – create the xblock with the selected template */
  const handleModalSubmit = async () => {
    if (!modalTemplate || !selectedTemplateValue) {
      return;
    }
    // Find the matching template entry from the selected radio value
    const selected = modalTemplate.templates.find(
      (tpl) => (tpl.boilerplateName || tpl.category) === selectedTemplateValue,
    );
    if (selected) {
      await handleAddComponent(
        modalTemplate.type,
        selected.category || modalTemplate.type,
        selected.boilerplateName,
      );
    }
    // Close the modal
    setIsModalOpen(false);
    setModalTemplate(null);
    setSelectedTemplateValue('');
  };

  /** Close the modal without creating anything */
  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalTemplate(null);
    setSelectedTemplateValue('');
  };

  // Split templates into normal components and advanced components
  const { normalTemplates, advancedTemplate } = useMemo(() => {
    const normal: ComponentTemplate[] = [];
    let advanced: ComponentTemplate | undefined;
    componentTemplates.forEach((tpl) => {
      if (!tpl.templates || tpl.templates.length === 0) {
        return;
      }
      if (tpl.type === 'advanced') {
        advanced = tpl;
      } else {
        normal.push(tpl);
      }
    });
    return { normalTemplates: normal, advancedTemplate: advanced };
  }, [componentTemplates]);

  // Resolve the support level label for advanced xblock items
  // fs/true = fully supported (no label), ps = partially supported, us/other = not supported
  const getSupportLabel = (supportLevel?: string | boolean): string | null => {
    if (supportLevel === true || supportLevel === 'fs') {
      return null;
    }
    if (supportLevel === 'ps') {
      return intl.formatMessage(messages.supportPartiallySupported);
    }
    return intl.formatMessage(messages.supportNotSupported);
  };

  if (normalTemplates.length === 0 && !advancedTemplate && !showPasteXBlock) {
    return null;
  }

  return (
    <>
      <Dropdown id={`add-component-${unitId}`} data-testid="add-component-dropdown">
        <Dropdown.Toggle
          id={`add-component-toggle-${unitId}`}
          variant="tertiary"
          size="sm"
          className="add-component-toggle w-100 bg-white text-dark-700 small rounded shadow-none"
          disabled={isPending}
        >
          <span className="d-flex align-items-center w-100">
            {isPending ? (
              <Spinner animation="border" size="sm" className="mr-2" />
            ) : (
              <Icon src={AddIcon} className="mr-2" />
            )}
            <span>{intl.formatMessage(messages.addComponentButton)}</span>
            <Icon src={ArrowDropDownIcon} className="ml-auto" />
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu className="add-component-dropdown-menu w-100 overflow-auto border border-light-400 shadow-sm">
          {/* Paste component – shown when clipboard has a pasteable xblock */}
          {showPasteXBlock && onPasteComponent && (
            <>
              <Dropdown.Item
                onClick={onPasteComponent}
                disabled={isPending}
                className="d-flex justify-content-between align-items-center pt-3 pb-2"
                data-testid="add-component-item-paste"
              >
                {intl.formatMessage(messages.pasteComponent)}
              </Dropdown.Item>
              <Dropdown.Divider />
            </>
          )}

          {/* Normal component types – opens modal if multiple templates, else creates directly */}
          {normalTemplates.map((template) => (
            <Dropdown.Item
              key={template.type}
              onClick={() => handleDropdownItemClick(template)}
              disabled={isPending}
              data-testid={`add-component-item-${template.type}`}
            >
              {template.displayName}
            </Dropdown.Item>
          ))}

          {/* Advanced section: header + individual advanced xblock templates */}
          {advancedTemplate && (
            <>
              <Dropdown.Header className="x-small font-weight-normal text-gray-500 mt-1">
                {advancedTemplate.displayName}
              </Dropdown.Header>
              {advancedTemplate.templates.map((tpl) => {
                const supportLabel = getSupportLabel(tpl.supportLevel);
                return (
                  <Dropdown.Item
                    key={`advanced-${tpl.category}-${tpl.boilerplateName || 'default'}`}
                    onClick={() => handleAddComponent(
                      'advanced',
                      tpl.category || 'advanced',
                      tpl.boilerplateName,
                    )}
                    disabled={isPending}
                    data-testid={`add-component-item-advanced-${tpl.category}`}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>{tpl.displayName}</span>
                    {supportLabel && (
                      <span className="text-nowrap shrink-0 text-muted small ml-3">
                        {supportLabel}
                      </span>
                    )}
                  </Dropdown.Item>
                );
              })}
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>

      {/* Template selection modal – shown when a component type has multiple sub-templates */}
      {modalTemplate && (
        <StandardModal
          title={intl.formatMessage(messages.templateModalTitle, {
            componentTitle: (modalTemplate.displayName ?? '').toLowerCase(),
          })}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          size="md"
          footerNode={(
            <ActionRow>
              <ActionRow.Spacer />
              <Button variant="tertiary" onClick={handleModalClose}>
                {intl.formatMessage(messages.templateModalCancel)}
              </Button>
              <Button
                onClick={handleModalSubmit}
                disabled={!selectedTemplateValue || isPending}
              >
                {intl.formatMessage(messages.templateModalSelect)}
              </Button>
            </ActionRow>
          )}
        >
          <Form.Group>
            <Form.RadioSet
              name={modalTemplate.displayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedTemplateValue(e.target.value)}
            >
              {modalTemplate.templates.map((tpl) => {
                // Radio value is boilerplateName or category – matches how course-unit modal works
                const value = tpl.boilerplateName || tpl.category || '';
                return (
                  <div
                    key={tpl.displayName}
                    className="d-flex justify-content-between w-100 mb-2 align-items-end"
                  >
                    <Form.Radio value={value}>
                      {tpl.displayName}
                    </Form.Radio>
                  </div>
                );
              })}
            </Form.RadioSet>
          </Form.Group>
        </StandardModal>
      )}
    </>
  );
};

export default AddComponentWidget;

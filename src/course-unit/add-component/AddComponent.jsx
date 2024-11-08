import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';

import { getCourseSectionVertical } from '../data/selectors';
import { COMPONENT_TYPES } from '../../generic/block-type-utils/constants';
import ComponentModalView from './add-component-modals/ComponentModalView';
import AddComponentButton from './add-component-btn';
import messages from './messages';

const AddComponent = ({
  parentLocator,
  handleCreateNewCourseXBlock,
  isUnitVerticalType,
  handleSubmitAddComponentModal,
  addComponentTemplateData,
  setAddComponentTemplateData,
}) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [isOpenAdvanced, openAdvanced, closeAdvanced] = useToggle(false);
  const [isOpenHtml, openHtml, closeHtml] = useToggle(false);
  const [isOpenOpenAssessment, openOpenAssessment, closeOpenAssessment] = useToggle(false);
  const { componentTemplates = {} } = useSelector(getCourseSectionVertical);
  const isRequestedModalView = addComponentTemplateData?.model?.type;
  const blockId = addComponentTemplateData.parentLocator || parentLocator;

  const handleCreateNewXBlock = (type, moduleName) => {
    const preventDisplayLoading = isRequestedModalView && !isUnitVerticalType;
    switch (type) {
      case COMPONENT_TYPES.discussion:
      case COMPONENT_TYPES.dragAndDrop:
        handleCreateNewCourseXBlock({
          type,
          parentLocator: blockId,
        }, null, preventDisplayLoading);
        break;
      case COMPONENT_TYPES.problem:
      case COMPONENT_TYPES.video:
        handleCreateNewCourseXBlock(
          {
            type,
            parentLocator: blockId,
          },
          ({ courseKey, locator }) => navigate(`/course/${courseKey}/editor/${type}/${locator}`),
          preventDisplayLoading,
        );
        break;
        // TODO: The library functional will be a bit different of current legacy (CMS)
        //  behaviour and this ticket is on hold (blocked by other development team).
      case COMPONENT_TYPES.library:
        handleCreateNewCourseXBlock(
          {
            type,
            category: 'library_content',
            parentLocator: blockId,
          },
          null,
          preventDisplayLoading,
        );
        break;
      case COMPONENT_TYPES.advanced:
        handleCreateNewCourseXBlock(
          {
            type: moduleName,
            category: moduleName,
            parentLocator: blockId,
          },
          null,
          preventDisplayLoading,
        );
        break;
      case COMPONENT_TYPES.openassessment:
        handleCreateNewCourseXBlock(
          {
            boilerplate: moduleName,
            category:
            type,
            parentLocator: blockId,
          },
          null,
          preventDisplayLoading,
        );
        break;
      case COMPONENT_TYPES.html:
        handleCreateNewCourseXBlock(
          {
            type,
            boilerplate: moduleName,
            parentLocator: blockId,
          },
          ({ courseKey, locator }) => navigate(`/course/${courseKey}/editor/html/${locator}`),
          preventDisplayLoading,
        );
        break;
      default:
    }
    if (preventDisplayLoading) {
      handleSubmitAddComponentModal();
    }
  };

  if (isRequestedModalView && !isUnitVerticalType) {
    return (
      <ComponentModalView
        isRequestedModalView
        key={addComponentTemplateData.model.type}
        component={addComponentTemplateData.model}
        handleCreateNewXBlock={handleCreateNewXBlock}
        modalParams={{
          open: () => {},
          close: () => setAddComponentTemplateData({}),
          isOpen: addComponentTemplateData.model,
        }}
      />
    );
  }

  if (Object.keys(componentTemplates).length && isUnitVerticalType) {
    return (
      <div className="py-4">
        <h5 className="h3 mb-4 text-center">{intl.formatMessage(messages.title)}</h5>
        <ul className="new-component-type list-unstyled m-0 d-flex flex-wrap justify-content-center">
          {componentTemplates.map((component) => {
            const { type, displayName } = component;
            let modalParams;

            if (!component.templates.length) {
              return null;
            }

            switch (type) {
              case COMPONENT_TYPES.advanced:
                modalParams = {
                  open: openAdvanced,
                  close: closeAdvanced,
                  isOpen: isOpenAdvanced,
                };
                break;
              case COMPONENT_TYPES.html:
                modalParams = {
                  open: openHtml,
                  close: closeHtml,
                  isOpen: isOpenHtml,
                };
                break;
              case COMPONENT_TYPES.openassessment:
                modalParams = {
                  open: openOpenAssessment,
                  close: closeOpenAssessment,
                  isOpen: isOpenOpenAssessment,
                };
                break;
              default:
                return (
                  <li key={type}>
                    <AddComponentButton
                      onClick={() => handleCreateNewXBlock(type)}
                      displayName={displayName}
                      type={type}
                    />
                  </li>
                );
            }

            return (
              <ComponentModalView
                key={type}
                component={component}
                handleCreateNewXBlock={handleCreateNewXBlock}
                modalParams={modalParams}
              />
            );
          })}
        </ul>
      </div>
    );
  }

  return null;
};

AddComponent.defaultProps = {
  addComponentTemplateData: {},
  setAddComponentTemplateData: () => {},
};

AddComponent.propTypes = {
  isUnitVerticalType: PropTypes.bool.isRequired,
  parentLocator: PropTypes.string.isRequired,
  handleCreateNewCourseXBlock: PropTypes.func.isRequired,
  addComponentTemplateData: {
    blockId: PropTypes.string.isRequired,
    model: PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      category: PropTypes.string,
      type: PropTypes.string.isRequired,
      templates: PropTypes.arrayOf(
        PropTypes.shape({
          boilerplateName: PropTypes.string,
          category: PropTypes.string,
          displayName: PropTypes.string.isRequired,
          supportLevel: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        }),
      ),
      supportLegend: PropTypes.shape({
        allowUnsupportedXblocks: PropTypes.bool,
        documentationLabel: PropTypes.string,
        showLegend: PropTypes.bool,
      }),
    }),
  },
  setAddComponentTemplateData: PropTypes.func,
  handleSubmitAddComponentModal: PropTypes.func.isRequired,
};

export default AddComponent;

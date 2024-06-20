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

const AddComponent = ({ blockId, handleCreateNewCourseXBlock }) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [isOpenAdvanced, openAdvanced, closeAdvanced] = useToggle(false);
  const [isOpenHtml, openHtml, closeHtml] = useToggle(false);
  const [isOpenOpenAssessment, openOpenAssessment, closeOpenAssessment] = useToggle(false);
  const { componentTemplates } = useSelector(getCourseSectionVertical);

  const handleCreateNewXBlock = (type, moduleName) => {
    switch (type) {
      case COMPONENT_TYPES.discussion:
      case COMPONENT_TYPES.dragAndDrop:
        handleCreateNewCourseXBlock({ type, parentLocator: blockId });
        break;
      case COMPONENT_TYPES.problem:
      case COMPONENT_TYPES.video:
        handleCreateNewCourseXBlock({ type, parentLocator: blockId }, ({ courseKey, locator }) => {
          navigate(`/course/${courseKey}/editor/${type}/${locator}`);
        });
        break;
        // TODO: The library functional will be a bit different of current legacy (CMS)
        //  behaviour and this ticket is on hold (blocked by other development team).
      case COMPONENT_TYPES.library:
        handleCreateNewCourseXBlock({ type, category: 'library_content', parentLocator: blockId });
        break;
      case COMPONENT_TYPES.advanced:
        handleCreateNewCourseXBlock({
          type: moduleName, category: moduleName, parentLocator: blockId,
        });
        break;
      case COMPONENT_TYPES.openassessment:
        handleCreateNewCourseXBlock({
          boilerplate: moduleName, category: type, parentLocator: blockId,
        });
        break;
      case COMPONENT_TYPES.html:
        handleCreateNewCourseXBlock({
          type,
          boilerplate: moduleName,
          parentLocator: blockId,
        }, ({ courseKey, locator }) => {
          navigate(`/course/${courseKey}/editor/html/${locator}`);
        });
        break;
      default:
    }
  };

  if (!Object.keys(componentTemplates).length) {
    return null;
  }

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
};

AddComponent.propTypes = {
  blockId: PropTypes.string.isRequired,
  handleCreateNewCourseXBlock: PropTypes.func.isRequired,
};

export default AddComponent;

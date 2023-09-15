import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible } from '@edx/paragon';
import messages from './messages';
import { getContentMenuItem, getSettingMenuItems, getToolsMenuItems } from './utils';

const MobileMenu = ({
  studioBaseUrl,
  courseId,
  // injected
  intl,
}) => {
  const contentItems = getContentMenuItem({ studioBaseUrl, courseId, intl });
  const settingsItems = getSettingMenuItems({ studioBaseUrl, courseId, intl });
  const toolsItems = getToolsMenuItems({ studioBaseUrl, courseId, intl });

  return (
    <div
      className="ml-4 p-2 bg-light-100 border border-gray-200 small rounded"
      data-testid="mobile-menu"
    >
      <div>
        <Collapsible
          className="border-light-100"
          title={intl.formatMessage(messages['header.links.content'])}
        >
          <ul className="p-0" style={{ listStyleType: 'none' }}>
            {contentItems.map(item => (
              <li className="mobile-menu-item">
                <a href={item.href}>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </Collapsible>
        <Collapsible
          className="border-light-100"
          title={intl.formatMessage(messages['header.links.settings'])}
        >
          <ul className="p-0" style={{ listStyleType: 'none' }}>
            {settingsItems.map(item => (
              <li className="mobile-menu-item">
                <a href={item.href}>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </Collapsible>
        <Collapsible
          className="border-light-100"
          title={intl.formatMessage(messages['header.links.tools'])}
        >
          <ul className="p-0" style={{ listStyleType: 'none' }}>
            {toolsItems.map(item => (
              <li className="mobile-menu-item">
                <a href={item.href}>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </Collapsible>
      </div>
    </div>
  );
};

MobileMenu.propTypes = {
  courseId: PropTypes.string.isRequired,
  studioBaseUrl: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(MobileMenu);

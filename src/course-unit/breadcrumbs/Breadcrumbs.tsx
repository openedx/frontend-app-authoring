import { useSelector } from 'react-redux';
import { Dropdown, Icon } from '@openedx/paragon';
import { Link } from 'react-router-dom';
import {
  ArrowDropDown as ArrowDropDownIcon,
  ChevronRight as ChevronRightIcon,
} from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';

import { useWaffleFlags } from '../../data/apiHooks';
import { getCourseSectionVertical } from '../data/selectors';
import { adoptCourseSectionUrl, subsectionFirstUnitEditUrl } from '../utils';

const Breadcrumbs = ({ courseId, parentUnitId }: { courseId: string, parentUnitId: string }) => {
  const { ancestorXblocks = [] } = useSelector(getCourseSectionVertical);
  const waffleFlags = useWaffleFlags(courseId);

  const getPathToCourseOutlinePage = (url) => (waffleFlags.useNewCourseOutlinePage
    ? url : `${getConfig().STUDIO_BASE_URL}${url}`);

  const getPathToCourseUnitPage = (url) => (waffleFlags.useNewUnitPage
    ? adoptCourseSectionUrl({ url, courseId, parentUnitId })
    : `${getConfig().STUDIO_BASE_URL}${url}`);

  // based on the level of breadcrumbs the url will differ
  // at the subsection level it should navigate to the first unit if available
  // if no unit then navigate to the subsection outline
  function getPathToCoursePage(index, url, usageKey: string) {
    let navUrl: string;
    if (index === 0) {
      navUrl = getPathToCourseOutlinePage(url);
    } else if (index === 1) {
      navUrl = subsectionFirstUnitEditUrl({ courseId, subsectionId: usageKey });
    } else {
      navUrl = getPathToCourseUnitPage(url);
    }
    return navUrl;
  }

  const hasChildWithUrl = (children = []) => (
    !!children.filter((child : any) => child?.url).length
  );

  return (
    <nav className="d-flex align-center mb-2.5">
      <ol className="p-0 m-0 d-flex align-center flex-wrap">
        {ancestorXblocks.map(({ children, title, isLast }, index) => (
          <li
            className="d-flex mb-2.5"
            // eslint-disable-next-line react/no-array-index-key
            key={`${title}-${index}`}
          >
            {hasChildWithUrl(children) ? (
              <Dropdown>
                <Dropdown.Toggle
                  id="breadcrumbs-dropdown-section"
                  variant="link"
                  className="p-0 text-primary small"
                >
                  <span className="small text-gray-700">
                    {title}
                  </span>
                  <Icon
                    src={ArrowDropDownIcon}
                    className="text-primary ml-1"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {children.map(({ url, displayName, usageKey }) => (
                    <Dropdown.Item
                      as={Link}
                      key={url}
                      to={getPathToCoursePage(index, url, usageKey)}
                      className="small"
                      data-testid={`breadcrumbs-dropdown-item-level-${index}`}
                    >
                      {displayName}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <span className="p-0 text-primary small btn btn-link text-decoration-none">
                <span className="small text-gray-700">
                  {title}
                </span>
              </span>
            )}
            {!isLast && (
              <Icon
                src={ChevronRightIcon}
                size="md"
                className="text-primary mx-2"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { groupNotesByDate } from '../utils/groupNotes';

const ReleaseNotesSidebar = ({ notes, activeNoteId, onNoteClick }) => {
  const intl = useIntl();
  const groups = useMemo(() => groupNotesByDate(notes, intl), [notes, intl]);

  return (
    <aside className="release-notes-sidebar">
      <div className="pt-5">
        {groups.map((g) => {
          const isActiveGroup = g.items.some((n) => String(n.id) === String(activeNoteId));
          return (
            <div key={g.key} className="mb-3">
              <h6 className={isActiveGroup ? 'mb-1 font-weight-bold' : 'mb-1 font-weight-normal'}>{g.label}</h6>
              <ul className="list-unstyled m-0 p-0 ml-3">
                {g.items.map((n) => (
                  <li key={n.id} className="mb-2">
                    <a
                      href={`#note-${n.id}`}
                      className="text-decoration-none"
                      onClick={() => onNoteClick && onNoteClick(n.id)}
                    >
                      {n.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

ReleaseNotesSidebar.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    published_at: PropTypes.string,
  })).isRequired,
  activeNoteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onNoteClick: PropTypes.func,
};

ReleaseNotesSidebar.defaultProps = {
  activeNoteId: undefined,
  onNoteClick: undefined,
};

export default ReleaseNotesSidebar;

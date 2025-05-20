import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
// import { Icon } from '@openedx/paragon';
import { Add, ArrowRight as ArrowDownIcon, ArrowDropUp as ArrowUpIcon, VerticalAlignCenter } from '@openedx/paragon/icons';

const StatusBarContent = ({ onAddSection, onCollapseAll, isSectionsExpanded, handleExpandAll }) => {
    return (
        <div className="d-flex justify-content-between align-items-center mt-4">
            <h4>Content</h4>
            <div className="d-flex align-items-center">
                <Icon
                    src={Add}
                    onClick={onAddSection}
                    className="mx-2"
                    aria-label="Add Section"
                    data-tooltip="New Section"
                />
                <Icon
                    src={isSectionsExpanded ? VerticalAlignCenter : VerticalAlignCenter}
                    onClick={handleExpandAll}
                    className="mx-2 "
                    aria-label={isSectionsExpanded ? 'Collapse All' : 'Expand All'}
                    data-tooltip={isSectionsExpanded ? 'Collapse All' : 'Expand All'}
                />
            </div>
        </div>
    );
};

StatusBarContent.propTypes = {
    onAddSection: PropTypes.func.isRequired,
    onCollapseAll: PropTypes.func.isRequired,
    isSectionsExpanded: PropTypes.bool.isRequired,
    handleExpandAll: PropTypes.func.isRequired,
};

export default StatusBarContent; 
import React, { useState, useEffect } from 'react';
import { FormGroup, FormControl } from '@openedx/paragon';
import { ExpandMore } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

const CustomFilterDropdown = ({ value, onChange, options, allLabelMessage, showSearch }) => {
    const intl = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredOptions, setFilteredOptions] = useState([]);

    useEffect(() => {
        const opts = options.map(opt => {
            const displayValue = typeof opt === 'object' && opt.string ? opt.string : opt;
            const optionValue = typeof opt === 'object' && opt.string ? opt.string : opt;

            return {
                label: displayValue === 'all' ? intl.formatMessage(allLabelMessage) : displayValue,
                value: optionValue,
            };
        });

        setFilteredOptions(
            opts.filter(opt => opt.label.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [options, searchText, allLabelMessage, intl]);

    const handleOptionClick = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    const toggleDropdown = () => setIsOpen(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('[data-dropdown]')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = filteredOptions.find(opt => opt.value === value);
    const selectedLabel = selectedOption ? selectedOption.label : '';

    return (
        <FormGroup
            data-dropdown
            style={{ position: 'relative', maxWidth: '250px' }}
        >
            <div style={{ position: 'relative' }}>
                <FormControl
                    readOnly
                    value={selectedLabel}
                    placeholder={intl.formatMessage({ id: 'select.placeholder', defaultMessage: 'Select...' })}
                    onClick={toggleDropdown}
                    style={{
                        cursor: 'pointer',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        paddingRight: '30px',
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: 'var(--text-primary)',
                    }}
                >
                    <ExpandMore style={{ width: '24px', height: '24px' }} />
                </div>
            </div>

            {isOpen && (
                <div
                    data-dropdown
                    style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        right: 0,
                        maxHeight: '250px',
                        overflowY: 'auto',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-surface)',
                        zIndex: 1000,
                        padding: '5px 0',
                    }}
                >
                    {showSearch && (
                        <FormControl
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder={intl.formatMessage({ id: 'search.placeholder', defaultMessage: 'Search...' })}
                            style={{
                                margin: '5px',
                                width: 'calc(100% - 10px)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-body)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    )}
                    <div>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => handleOptionClick(opt)}
                                    style={{
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                        padding: '5px 10px',
                                        borderBottom: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                        background: 'var(--bg-surface)',
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '5px 10px', color: 'var(--text-secondary)' }}>
                                {intl.formatMessage({ id: 'no.results', defaultMessage: 'No results found' })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </FormGroup>
    );
};

CustomFilterDropdown.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ string: PropTypes.string })])
    ),
    allLabelMessage: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
    showSearch: PropTypes.bool,
};

CustomFilterDropdown.defaultProps = {
    value: '',
    options: [],
    showSearch: true,
};

export default CustomFilterDropdown;

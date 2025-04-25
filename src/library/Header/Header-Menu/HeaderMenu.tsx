/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState } from 'react';
import { HeaderMenuProps } from '../../interfaces/components';
import { Button, Menu, MenuItem, ModalPopup, useToggle } from '@openedx/paragon';
import { KeyboardArrowDown, KeyboardArrowUp } from '@openedx/paragon/icons';
import './HeaderMenu.scss'; // ✅ Updated to global SCSS

const HeaderMenu: React.FC<HeaderMenuProps> = ({ menu }) => {
    const [target, setTarget] = useState<HTMLElement | null>(null);
    const [isOpen, open, close] = useToggle(false);

    const handleToggle = () => {
        isOpen ? close() : open();
    };

    return (
        <>
            <Button
                ref={setTarget}
                iconAfter={isOpen ? KeyboardArrowUp : KeyboardArrowDown}
                variant="link"
                size="sm"
                onClick={handleToggle}
                className="menuButtonHeader" // ✅ Global class name
            >
                {menu.label}
            </Button>

            <ModalPopup
                isOpen={isOpen}
                onClose={close}
                positionRef={target}
                placement="bottom-start"
                style={{ zIndex: 9999 }}
            >
                <div className="dropdownMenu"> {/* ✅ Global class name */}
                    <Menu>
                        {(menu?.subMenu ?? []).map((sub, idx) => (
                            <div key={idx}>
                                <MenuItem
                                    as={Button}
                                    variant="tertiary"
                                    size="inline"
                                    className="dropdownMenuItem" // ✅ Global class name
                                    onClick={() => {
                                        console.log('Selected submenu:', sub.value || sub.label);
                                        close();
                                    }}
                                >
                                    {sub.label}
                                </MenuItem>
                            </div>
                        ))}
                    </Menu>
                </div>
            </ModalPopup>
        </>
    );
};

export default HeaderMenu;

import React, { useContext } from 'react';
import Select, { components } from 'react-select';
import type {
  GroupBase,
  IndicatorsContainerProps,
  InputActionMeta,
  MenuProps,
  SelectInstance,
} from 'react-select';
// This import is necessary for the module augmentation below.
// It allows us to extend the 'Props' interface in the 'react-select/base' module
// and add our custom properties to it.
import type {} from 'react-select/base';
import {
  Collapsible,
  Button,
  Spinner,
  Chip,
  Icon,
} from '@openedx/paragon';
import { Tag, KeyboardArrowDown, KeyboardArrowUp } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { debounce } from 'lodash';

import SelectableBox from '../editors/sharedComponents/SelectableBox';
import messages from './messages';

import ContentTagsDropDownSelector from './ContentTagsDropDownSelector';

import useContentTagsCollapsibleHelper from './ContentTagsCollapsibleHelper';
import TagsTree from './TagsTree';
import { ContentTagsDrawerContext } from './common/context';
import type { DrawerTaxonomy, StagedTagData } from './data/types';

export interface TagTreeEntry {
  explicit: boolean;
  children: Record<string, TagTreeEntry>;
  isCopied: boolean;
  canChangeObjecttag: boolean;
  canDeleteObjecttag: boolean;
}

export interface TaxonomySelectProps {
  taxonomyId: number;
  searchTerm: string;
  appliedContentTagsTree: Record<string, TagTreeEntry>;
  stagedContentTagsTree: Record<string, TagTreeEntry>;
  checkedTags: string[];
  selectCancelRef: React.RefObject<HTMLButtonElement>;
  selectAddRef: React.RefObject<HTMLButtonElement>;
  selectInlineAddRef: React.RefObject<HTMLButtonElement>;
  handleCommitStagedTags: () => void;
  handleCancelStagedTags: () => void;
  handleSelectableBoxChange: React.ChangeEventHandler<HTMLInputElement>;
}

// Unfortunately the only way to specify the custom props we pass into React Select
// is with this global type augmentation.
// https://react-select.com/typescript#custom-select-props
// If in the future other parts of this MFE need to use React Select for different things,
// we should change to using a 'react context' to share this data within <ContentTagsCollapsible>,
// rather than using the custom <Select> Props (selectProps).
declare module 'react-select/base' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface Props<Option, IsMulti extends boolean, Group extends GroupBase<Option>> extends TaxonomySelectProps {
  }
}

export type TagTree = {
  [key: string]: {
    children: TagTree;
    canChangeObjecttag: boolean;
    canDeleteObjecttag: boolean;
    explicit: boolean;
    isCopied: boolean;
  };
};

/**
 * Custom Menu component for our Select box
 */
const CustomMenu = (props: MenuProps<StagedTagData, true>) => {
  const {
    handleSelectableBoxChange,
    checkedTags,
    taxonomyId,
    appliedContentTagsTree,
    stagedContentTagsTree,
    handleCommitStagedTags,
    handleCancelStagedTags,
    searchTerm,
    selectCancelRef,
    selectAddRef,
    value,
  } = props.selectProps;
  const stagedTags: readonly StagedTagData[] = Array.isArray(value) ? value : [];
  const intl = useIntl();
  return (
    <components.Menu {...props}>
      <div className="bg-white p-3 shadow">
        <SelectableBox.Set
          type="checkbox"
          name="tags"
          columns={1}
          ariaLabel={intl.formatMessage(messages.taxonomyTagsAriaLabel)}
          className="taxonomy-tags-selectable-box-set"
          onChange={handleSelectableBoxChange}
          value={checkedTags}
          tabIndex={-1}
        >
          <ContentTagsDropDownSelector
            key={`selector-${taxonomyId}`}
            taxonomyId={taxonomyId}
            level={0}
            appliedContentTagsTree={appliedContentTagsTree}
            stagedContentTagsTree={stagedContentTagsTree}
            searchTerm={searchTerm}
          />
        </SelectableBox.Set>
        <hr className="mt-0 mb-0" />
        <div className="d-flex flex-row justify-content-end">
          <div className="d-inline">
            <Button
              tabIndex={0}
              ref={selectCancelRef}
              variant="tertiary"
              className="tags-drawer-cancel-button"
              onClick={handleCancelStagedTags}
            >
              {intl.formatMessage(messages.collapsibleCancelStagedTagsButtonText)}
            </Button>
            <Button
              tabIndex={0}
              ref={selectAddRef}
              variant="tertiary"
              className="text-info-500 add-tags-button"
              disabled={!stagedTags.length}
              onClick={handleCommitStagedTags}
            >
              {intl.formatMessage(messages.collapsibleAddStagedTagsButtonText)}
            </Button>
          </div>
        </div>
      </div>
    </components.Menu>
  );
};

const disableActionKeys = (e: React.KeyboardEvent) => {
  const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Backspace'];
  if (arrowKeys.includes(e.code)) {
    e.preventDefault();
  }
};

const CustomLoadingIndicator = () => {
  const intl = useIntl();
  return (
    <Spinner
      animation="border"
      screenReaderText={intl.formatMessage(messages.loadingMessage)}
    />
  );
};

/**
 * Custom IndicatorsContainer component for our Select box
 */
const CustomIndicatorsContainer = (props: IndicatorsContainerProps<StagedTagData, true>) => {
  const {
    value,
    handleCommitStagedTags,
    selectInlineAddRef,
  } = props.selectProps;
  const stagedTags: readonly StagedTagData[] = Array.isArray(value) ? value : [];
  const intl = useIntl();
  return (
    <components.IndicatorsContainer {...props}>
      {(stagedTags.length > 0 && (
        <Button
          variant="dark"
          size="sm"
          className="mt-2 mb-2 rounded-0 inline-add-button"
          onClick={handleCommitStagedTags}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          ref={selectInlineAddRef}
          tabIndex={0}
          onKeyDown={disableActionKeys} // To prevent navigating staged tags when button focused
        >
          {intl.formatMessage(messages.collapsibleInlineAddStagedTagsButtonText)}
        </Button>
      )) || null}
      {props.children}
    </components.IndicatorsContainer>
  );
};

interface ContentTagsCollapsibleProps {
  /** Id of the content object */
  contentId: string;
  /** Taxonomy metadata & applied tags */
  taxonomyAndTagsData: DrawerTaxonomy;
  /** Array of staged tags represented as objects with value/label */
  stagedContentTags: StagedTagData[];
  /** True if the collapsible is open */
  collapsibleState: boolean;
}

/**
 * Collapsible component that holds a Taxonomy along with Tags that belong to it.
 * This includes both applied tags and tags that are available to select
 * from a dropdown list.
 *
 * This component also handles all the logic with selecting/deselecting tags and keeps track of the
 * tags tree in the state. That is used to render the Tag bubbgles as well as the populating the
 * state of the tags in the dropdown selectors.
 *
 * The `contentTags` that is passed are consolidated and converted to a tree structure. For example:
 *
 * FROM:
 *
 * [
 *   {
 *     "value": "DNA Sequencing",
 *     "lineage": [
 *       "Science and Research",
 *       "Genetics Subcategory",
 *       "DNA Sequencing"
 *     ]
 *   },
 *   {
 *     "value": "Virology",
 *     "lineage": [
 *       "Science and Research",
 *       "Molecular, Cellular, and Microbiology",
 *       "Virology"
 *     ]
 *   }
 * ]
 *
 * TO:
 *
 * {
 *   "Science and Research": {
 *     explicit: false,
 *     children: {
 *       "Genetics Subcategory": {
 *         explicit: false,
 *         children: {
 *           "DNA Sequencing": {
 *             explicit: true,
 *             children: {}
 *           }
 *         }
 *       },
 *       "Molecular, Cellular, and Microbiology": {
 *         explicit: false,
 *         children: {
 *           "Virology": {
 *             explicit: true,
 *             children: {}
 *           }
 *         }
 *       }
 *     }
 *   }
 * };
 *
 * It also keeps track of newly added tags as they are selected in the dropdown selectors.
 * They are store in the same format above, and then merged to one tree that is used as the
 * source of truth for both the tag bubble and the dropdowns. They keys are order alphabetically.
 *
 * In the dropdowns, the value of each SelectableBox is stored along with it's lineage and is URI encoded.
 * Ths is so we are able to traverse and manipulate different parts of the tree leading to it.
 * Here is an example of what the value of the "Virology" tag would be:
 *
 *  "Science%20and%20Research,Molecular%2C%20Cellular%2C%20and%20Microbiology,Virology"
 */
const ContentTagsCollapsible = ({
  contentId,
  taxonomyAndTagsData,
  stagedContentTags,
  collapsibleState,
}: ContentTagsCollapsibleProps) => {
  const intl = useIntl();
  const { id: taxonomyId, name, canTagObject } = taxonomyAndTagsData;
  const selectCancelRef = React.useRef<HTMLButtonElement>(null);
  const selectAddRef = React.useRef<HTMLButtonElement>(null);
  const selectInlineAddRef = React.useRef<HTMLButtonElement>(null);
  const selectInlineEditModeRef = React.useRef<HTMLButtonElement>(null);
  const selectRef = React.useRef<SelectInstance<StagedTagData, true>>(null);

  const [selectMenuIsOpen, setSelectMenuIsOpen] = React.useState(false);

  const {
    isEditMode,
    toEditMode,
    setStagedTags,
    openCollapsible,
    closeCollapsible,
  } = useContext(ContentTagsDrawerContext);

  const {
    tagChangeHandler,
    removeAppliedTagHandler,
    appliedContentTagsTree,
    stagedContentTagsTree,
    contentTagsCount,
    checkedTags,
    commitStagedTagsToGlobal,
    updateTags,
  } = useContentTagsCollapsibleHelper(
    contentId,
    stagedContentTags,
    taxonomyAndTagsData,
  );

  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSelectableBoxChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    tagChangeHandler(e.target.value, e.target.checked);
  }, [tagChangeHandler]);

  const handleSearch = debounce((term: string) => {
    setSearchTerm(term.trim());
  }, 500); // Perform search after 500ms

  const handleSearchChange = React.useCallback((value: string, { action }: InputActionMeta) => {
    if (action === 'input-blur') {
      if (!selectMenuIsOpen) {
        // Cancel/clear search if focused away from select input and menu closed
        handleSearch.cancel();
        setSearchTerm('');
      }
    } else if (action === 'input-change') {
      if (value === '') {
        // No need to debounce when search term cleared. Clear debounce function
        handleSearch.cancel();
        setSearchTerm('');
      } else {
        handleSearch(value);
      }
    }
  }, [selectMenuIsOpen, setSearchTerm, handleSearch]);

  // onChange handler for react-select component, currently only called when
  // staged tags in the react-select input are removed or fully cleared.
  // The remaining staged tags are passed in as the parameter, so we set the state
  // to the passed in tags
  const handleStagedTagsMenuChange = React.useCallback((stagedTags: readonly StagedTagData[]) => {
    // Get tags that were unstaged to remove them from checkbox selector
    const unstagedTags = stagedContentTags.filter(
      t1 => !stagedTags.some(t2 => t1.value === t2.value),
    );

    // Call the `tagChangeHandler` with the unstaged tags to unselect them from the selectbox
    // and update the staged content tags tree. Since the `handleStagedTagsMenuChange` function is={}
    // only called when a change occurs in the react-select menu component we know that tags can only be
    // removed from there, hence the tagChangeHandler is always called with `checked=false`.
    unstagedTags.forEach(unstagedTag => tagChangeHandler(unstagedTag.value, false));
    setStagedTags(taxonomyId, [...stagedTags]);
  }, [taxonomyId, setStagedTags, stagedContentTags, tagChangeHandler]);

  const handleCommitStagedTags = React.useCallback(() => {
    commitStagedTagsToGlobal();
    handleStagedTagsMenuChange([]);
    selectRef.current?.blur();
    setSearchTerm('');
    setSelectMenuIsOpen(false);
  }, [commitStagedTagsToGlobal, handleStagedTagsMenuChange, selectRef, setSearchTerm]);

  const handleCancelStagedTags = React.useCallback(() => {
    handleStagedTagsMenuChange([]);
    selectRef.current?.blur();
    setSearchTerm('');
    setSelectMenuIsOpen(false);
  }, [handleStagedTagsMenuChange, selectRef, setSearchTerm]);

  const handleSelectOnKeyDown = (event: React.KeyboardEvent) => {
    const focusedElement = event.target;

    if (event.key === 'Escape') {
      setSelectMenuIsOpen(false);
    } else if (event.key === 'Tab') {
      // Keep the menu open when navigating inside the select menu
      setSelectMenuIsOpen(true);

      // Determine when to close the menu when navigating with keyboard
      if (!event.shiftKey) { // Navigating forwards
        if (focusedElement === selectAddRef.current) {
          setSelectMenuIsOpen(false);
        } else if (focusedElement === selectCancelRef.current && selectAddRef.current?.disabled) {
          setSelectMenuIsOpen(false);
        }
        // Navigating backwards
      } else if (event.shiftKey && focusedElement === selectRef.current?.inputRef) {
        setSelectMenuIsOpen(false);
      }
    }
  };

  // Open the select menu and make sure the search term is cleared when focused
  const onSelectMenuFocus = React.useCallback(() => {
    setSelectMenuIsOpen(true);
    setSearchTerm('');
  }, [setSelectMenuIsOpen, setSearchTerm]);

  // Handles logic to close the select menu when clicking outside
  const handleOnBlur = React.useCallback((event: React.FocusEvent) => {
    // Check if a target we are focusing to is an element in our select menu, if not close it
    const menuClasses = ['dropdown-selector', 'inline-add-button', 'cancel-add-tags-button'];
    const { relatedTarget } = event;
    if (!relatedTarget || !menuClasses.some(cls => relatedTarget.className?.includes(cls))) {
      setSelectMenuIsOpen(false);
    }
  }, [setSelectMenuIsOpen]);

  return (
    <div className="d-flex">
      <Collapsible.Advanced
        className="collapsible-card-lg taxonomy-tags-collapsible"
        open={collapsibleState}
        onClose={() => closeCollapsible(taxonomyId)}
        onOpen={() => openCollapsible(taxonomyId)}
      >
        <Collapsible.Trigger className="collapsible-trigger pl-2.5">
          <Collapsible.Visible whenClosed>
            <Icon src={KeyboardArrowDown} />
          </Collapsible.Visible>

          <Collapsible.Visible whenOpen>
            <Icon src={KeyboardArrowUp} />
          </Collapsible.Visible>
          <h3 className="h5 flex-grow-1 pl-2">{name}</h3>
        </Collapsible.Trigger>

        <Collapsible.Body className="collapsible-body">
          {Object.keys(appliedContentTagsTree).length === 0 && !isEditMode
            && (
              <div className="mb-3" key={taxonomyId}>
                <p className="text-gray-500">
                  {intl.formatMessage(messages.collapsibleNoTagsAddedText)}
                  {canTagObject && (
                    <Button
                      tabIndex={0}
                      size="inline"
                      ref={selectInlineEditModeRef}
                      variant="link"
                      className="text-info-500 add-tags-button"
                      onClick={toEditMode}
                    >
                      {intl.formatMessage(messages.collapsibleAddStagedTagsButtonText)}
                    </Button>
                  )}
                </p>
              </div>
            )}
          {Object.keys(appliedContentTagsTree).length !== 0
            && (
              <div className="mb-3" key={taxonomyId}>
                <TagsTree
                  tags={appliedContentTagsTree}
                  parentKey={taxonomyId.toString()}
                  removeTagHandler={removeAppliedTagHandler}
                />
              </div>
            )}

          <div className="d-flex taxonomy-tags-selector-menu">
            {isEditMode && canTagObject && (
              <Select
                onBlur={handleOnBlur}
                styles={{
                  // Overriding 'x' button styles for staged tags when navigating by keyboard
                  multiValueRemove: (base, state) => ({
                    ...base,
                    background: state.isFocused ? 'black' : base.background,
                    color: state.isFocused ? 'white' : base.color,
                  }),
                }}
                menuIsOpen={selectMenuIsOpen}
                onFocus={onSelectMenuFocus}
                onKeyDown={handleSelectOnKeyDown}
                ref={selectRef}
                isMulti
                isLoading={updateTags.isPending}
                isDisabled={updateTags.isPending}
                name="tags-select"
                placeholder={intl.formatMessage(messages.collapsibleAddTagsPlaceholderText)}
                isSearchable
                className="d-flex flex-column flex-fill"
                classNamePrefix="react-select-add-tags"
                onInputChange={handleSearchChange}
                onChange={handleStagedTagsMenuChange}
                components={{
                  Menu: CustomMenu,
                  LoadingIndicator: CustomLoadingIndicator,
                  IndicatorsContainer: CustomIndicatorsContainer,
                }}
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                handleSelectableBoxChange={handleSelectableBoxChange}
                checkedTags={checkedTags}
                taxonomyId={taxonomyId}
                appliedContentTagsTree={appliedContentTagsTree}
                stagedContentTagsTree={stagedContentTagsTree}
                handleCommitStagedTags={handleCommitStagedTags}
                handleCancelStagedTags={handleCancelStagedTags}
                searchTerm={searchTerm}
                selectCancelRef={selectCancelRef}
                selectAddRef={selectAddRef}
                selectInlineAddRef={selectInlineAddRef}
                value={stagedContentTags}
              />
            )}
          </div>
        </Collapsible.Body>
      </Collapsible.Advanced>
      <div className="d-flex align-items-start pt-2.5 taxonomy-tags-count-chip">
        <Chip
          className="border-0"
          iconBefore={Tag}
          iconBeforeAlt="icon-before"
          disabled={contentTagsCount === 0}
        >
          {contentTagsCount}
        </Chip>
      </div>
    </div>
  );
};

export default ContentTagsCollapsible;

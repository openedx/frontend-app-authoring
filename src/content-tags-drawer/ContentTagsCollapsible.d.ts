import type {} from 'react-select/base';
// This import is necessary for module augmentation.
// It allows us to extend the 'Props' interface in the 'react-select/base' module
// and add our custom property 'myCustomProp' to it.

export interface TagTreeEntry {
    explicit: boolean;
    children: Record<string, TagTreeEntry>;
}

export interface TaxonomySelectProps {
    taxonomyId: number;
    searchTerm: string;
    appliedContentTagsTree: Record<string, TagTreeEntry>;
    stagedContentTagsTree: Record<string, TagTreeEntry>;
    checkedTags: string[];
    handleCommitStagedTags: () => void;
    handleCancelStagedTags: () => void;
    handleSelectableBoxChange: React.ChangeEventHandler;
}

// Unfortunately the only way to specify the custom props we pass into React Select
// is with this global type augmentation.
// https://react-select.com/typescript#custom-select-props
// If in the future other parts of this MFE need to use React Select for different things,
// we should change to using a 'react context' to share this data within <ContentTagsCollapsible>,
// rather than using the custom <Select> Props (selectProps).
declare module 'react-select/base' {
  export interface Props<
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>
  > extends TaxonomySelectProps {
  }
}

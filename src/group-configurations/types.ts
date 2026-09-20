/* eslint-disable import/no-extraneous-dependencies */
import { AxiosError } from 'axios';

export interface UsageValidation {
  text: string;
  type: string;
}

export interface Usage {
  label: string;
  url: string;
  validation?: UsageValidation;
}

export interface Group {
  id: number;
  name: string;
  usage?: Usage[] | null;
  version: number;
}

/** A group that has not been persisted yet -- the backend assigns its id. */
export type NewGroup = Omit<Group, 'id'>;

export interface ContentGroupFormValues {
  newGroupName: string;
}

export interface AvailableGroupParameters {
  courseId?: string;
}

export interface AvailableGroup {
  active?: boolean;
  description?: string;
  groups: Group[];
  id: number;
  name: string;
  parameters?: AvailableGroupParameters;
  readOnly?: boolean;
  scheme: string;
  usage?: Usage[] | null;
  version: number;
}

/** The body sent when creating a group: the group being added has no id yet. */
export interface GroupCreatePayload extends Omit<AvailableGroup, 'groups'> {
  groups: (Group | NewGroup)[];
}

export type OnErrorCallbackFunc = (error: AxiosError) => void;

/**
 * Create/edit/delete handlers for a group configuration section.
 *
 * `handleDelete` takes the id of the thing being deleted, plus the id of the group
 * within it for content groups, which are nested under a parent configuration.
 *
 * The create/edit handlers are async, but callers close their form from the callback
 * rather than from the returned promise, so the return value is typed as `void`.
 */
export interface GroupActions {
  handleCreate: (group: GroupCreatePayload, callbackToClose: () => void) => void;
  handleEdit: (group: AvailableGroup, callbackToClose: () => void) => void;
  handleDelete: (id: number, groupId?: number) => void;
}

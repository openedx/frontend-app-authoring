export interface PermissionValidationRequestItem {
  action: string;
  scope?: string;
}

export interface PermissionValidationResponseItem extends PermissionValidationRequestItem {
  allowed: boolean;
}

export interface PermissionValidationQuery {
  [permissionKey: string]: PermissionValidationRequestItem;
}

export type PermissionValidationAnswer<Query extends PermissionValidationQuery = PermissionValidationQuery> = {
  [K in keyof Query]: boolean;
};

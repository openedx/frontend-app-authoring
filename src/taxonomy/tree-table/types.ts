import type {
  ColumnDef,
  Row,
  Table,
} from '@tanstack/react-table';

export type RowId = string | number;

export interface TreeRowData {
  id: RowId;
  value: string;
  subRows?: TreeRowData[];
  depth?: number;
  [key: string]: unknown;
}

export type TreeRow = Row<TreeRowData>;
export type TreeTable = Table<TreeRowData>;
export type TreeColumnDef = ColumnDef<TreeRowData, unknown>;

export interface CreateRowMutationState {
  isPending: boolean;
  isError: boolean;
  error: unknown;
}

export interface ToastState {
  show: boolean;
  message: string;
  variant: string;
}
import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (
      rowId?: string | number,
      columnId?: string,
      value?: unknown,
      rowData?: TData,
    ) => void;
    saveRow: (rowId: string | number, parentRowValue?: string) => void;
  }
}

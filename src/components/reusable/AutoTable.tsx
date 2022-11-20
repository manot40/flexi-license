import { Fragment } from 'react';
import { IconError404 } from '@tabler/icons';
import { Table, Skeleton, Flex, Text, ScrollArea, LoadingOverlay } from '@mantine/core';

export type ColumnData<T = unknown> = {
  id?: string;
  key: string;
  title: string;
  width?: number | string;
  render?: (cell: T[any], row: T) => React.ReactNode;
};

type AutoTableProps<DataRecord = any> = {
  data?: DataRecord[];
  columns: ColumnData<DataRecord>[];
  footer?: boolean;
  isLoading?: boolean;
  useScroll?: boolean;
  onClick?: (data: DataRecord) => void;
} & Omit<React.ComponentProps<typeof Table>, 'onClick'>;

export default function AutoTable({
  id = 'id',
  data,
  footer,
  onClick,
  columns,
  isLoading,
  useScroll = true,
  ...restProps
}: AutoTableProps) {
  const headerElement = columns.map((column, index) =>
    column ? (
      <th style={{ width: column.width }} key={index}>
        {column.title}
      </th>
    ) : (
      <th key={index}>
        <Skeleton h={16} />
      </th>
    )
  );

  const tableData = (data || Array(10).fill('')).map((row, i) => (
    <tr key={row[id] || i} onClick={() => onClick?.(row)} style={{ cursor: onClick && 'pointer' }}>
      {columns.map((column, i) => (
        <td key={i}>{row ? column.render?.(row[column.key], row) || row[column.key] : <Skeleton h={32} />}</td>
      ))}
    </tr>
  ));

  const Scroll = useScroll ? ScrollArea : Fragment;

  return (
    <Scroll>
      <LoadingOverlay zIndex={100} visible={isLoading as boolean} />
      <Table {...restProps}>
        <thead>
          <tr>{headerElement}</tr>
        </thead>
        <tbody>{tableData}</tbody>
        {footer && !!tableData.length && (
          <tfoot>
            <tr>{headerElement}</tr>
          </tfoot>
        )}
      </Table>
      {!tableData.length && (
        <Flex h={200} align="center" justify="center">
          <div style={{ textAlign: 'center' }}>
            <IconError404 size={42} color="gray" />
            <Text color="dimmed">Nothing to show here</Text>
          </div>
        </Flex>
      )}
    </Scroll>
  );
}

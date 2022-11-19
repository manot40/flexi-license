import { IconError404 } from '@tabler/icons';
import { Table, Skeleton, Flex, Text, ScrollArea } from '@mantine/core';

export type ColumnData<T = unknown> = {
  key: string;
  title: string;
  render?: (cell: T[any], row: T) => React.ReactNode;
};

type AutoTableProps<DataRecord = any> = {
  data?: DataRecord[];
  columns: ColumnData<DataRecord>[];
  footer?: boolean;
  onClick?: (data: DataRecord) => void;
} & React.ComponentProps<typeof Table>;

export default function AutoTable({ data, footer, onClick, columns, ...restProps }: AutoTableProps) {
  const headerElement = columns.map((column, index) =>
    column ? (
      <th key={index}>{column.title}</th>
    ) : (
      <th key={index}>
        <Skeleton h={16} />
      </th>
    )
  );

  const tableData = (data || Array(10).fill('')).map((row, index) => (
    <tr key={index} onClick={() => onClick?.(row)}>
      {columns.map((column, index) => (
        <td key={index}>{row ? column.render?.(row[column.key], row) || row[column.key] : <Skeleton h={32} />}</td>
      ))}
    </tr>
  ));

  return (
    <ScrollArea>
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
    </ScrollArea>
  );
}

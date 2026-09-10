import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

describe('Table', () => {
  it('renders headers and row data, marking a selected row', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow selected data-testid="row">
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(
      screen.getByRole('columnheader', { name: 'Name' })
    ).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByTestId('row')).toHaveAttribute('data-state', 'selected');
  });
});

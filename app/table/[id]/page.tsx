import { notFound } from 'next/navigation';
import { validateTableExists, getRequestTypesForTable } from '@/lib/actions/public-requests';
import { TableRequestClient } from './table-request-client';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Table ${id} - Request Service`,
    description: 'Request service at your table',
  };
}

export default async function TablePage({ params }: Props) {
  const { id } = await params;
  const tableNumber = parseInt(id, 10);

  if (isNaN(tableNumber) || tableNumber < 1) {
    notFound();
  }

  const tableExists = await validateTableExists(tableNumber);
  if (!tableExists) {
    notFound();
  }

  const requestTypes = await getRequestTypesForTable(tableNumber);

  return (
    <TableRequestClient
      tableNumber={tableNumber}
      requestTypes={requestTypes}
    />
  );
}

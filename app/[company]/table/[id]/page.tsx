import { notFound } from 'next/navigation';
import { validateTableByCompany, getRequestTypesByCompany } from '@/lib/actions/public-requests';
import { TableRequestClient } from './table-request-client';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ company: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Table ${id} - Request Service`,
    description: 'Request service at your table',
  };
}

export default async function TablePage({ params }: Props) {
  const { company, id } = await params;
  const tableNumber = parseInt(id, 10);

  if (isNaN(tableNumber) || tableNumber < 1) {
    notFound();
  }

  const validation = await validateTableByCompany(company, tableNumber);
  if (!validation.valid) {
    notFound();
  }

  const requestTypes = await getRequestTypesByCompany(company, tableNumber);

  return (
    <TableRequestClient
      tableNumber={tableNumber}
      requestTypes={requestTypes}
      companySlug={company}
    />
  );
}

import { notFound } from "next/navigation";
import Trainer from "@/components/Trainer";
import { TABLES } from "@/lib/constants";

type Props = { params: Promise<{ table: string }> };

export function generateStaticParams() {
  return TABLES.map((n) => ({ table: String(n) }));
}

export async function generateMetadata({ params }: Props) {
  const { table } = await params;
  return { title: `Таблиця множення на ${table}` };
}

export default async function TablePage({ params }: Props) {
  const { table } = await params;
  const n = Number(table);

  if (!Number.isInteger(n) || !(TABLES as readonly number[]).includes(n)) {
    notFound();
  }

  return (
    <main className="page">
      <Trainer table={n} />
    </main>
  );
}
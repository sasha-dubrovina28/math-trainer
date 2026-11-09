import Link from "next/link";
import { TABLES } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>Таблиця множення</h1>
          <p className="subtitle">
            Оберіть цифру для тренування · <b>Вправи</b>
          </p>
        </div>
      </header>

      <section className="card">
        <div className="card-head">
          <div className="card-title">
            <span className="dots">
              <i />
              <i />
            </span>
            Оберіть таблицю
          </div>
          <span className="tag">від 2 до 9</span>
        </div>

        <ul className="table-grid">
          {TABLES.map((n) => (
            <li key={n}>
              <Link href={`/multiplication/${n}`} className="table-link">
                <span className="table-num">× {n}</span>
                <span className="table-label">Таблиця множення на {n}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
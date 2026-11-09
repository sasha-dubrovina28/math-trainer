"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EXERCISES_COUNT } from "@/lib/constants";

type Phase = "idle" | "running" | "done";
type Tab = "exercises" | "instruction";

type Result = {
  a: number;
  b: number;
  user: number;
  correct: boolean;
  points: number;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const MAX_INPUT_LENGTH = 3;
const MAX_SECONDS = 20; 
const COLORS = {
  green: "#2e9e4f",
  yellow: "#f2d21b",
  orange: "#f58a1f",
  red: "#e5382f",
};

function generateMultipliers(): number[] {
  return Array.from({ length: EXERCISES_COUNT }, () => Math.floor(Math.random() * 10) + 1);
}
function getPoints(seconds: number): number {
  if (seconds < 10) return 10;
  if (seconds < 15) return 9;
  if (seconds < 20) return 8;
  return 7;
}

function getTimerColor(seconds: number): string {
  if (seconds < 10) return COLORS.green;
  if (seconds < 15) return COLORS.yellow;
  if (seconds < 20) return COLORS.orange;
  return COLORS.red;
}

function getFeedback(score: number): { text: string; emoji: string } {
  if (score >= 100) return { text: "Відмінно!", emoji: "😀" };
  if (score >= 70) return { text: "Добре!", emoji: "🙂" };
  if (score >= 40) return { text: "Непогано, але можна краще.", emoji: "😐" };
  return { text: "Потрібно ще потренуватись.", emoji: "😟" };
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function Trainer({ table }: { table: number }) {
  const [tab, setTab] = useState<Tab>("exercises");
  const [phase, setPhase] = useState<Phase>("idle");
  const [multipliers, setMultipliers] = useState<number[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [input, setInput] = useState("");


  const [sessionStart, setSessionStart] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [questionStart, setQuestionStart] = useState(0);
  const [now, setNow] = useState(0);

  const index = results.length;
  const current = multipliers[index];
  const answer = current !== undefined ? table * current : 0;

  const score = results.reduce((sum, r) => sum + r.points, 0);
  const lastResult = results[results.length - 1];
  const isLast = index === EXERCISES_COUNT - 1;

  const elapsed = phase === "running" ? Math.max(0, (now - questionStart) / 1000) : 0;
  const totalMs =
    phase === "idle"
      ? 0
      : phase === "done"
      ? endTime - sessionStart
      : Math.max(0, now - sessionStart);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [phase]);

  const start = () => {
    const t = Date.now();
    setMultipliers(generateMultipliers());
    setResults([]);
    setInput("");
    setSessionStart(t);
    setEndTime(0);
    setQuestionStart(t);
    setNow(t);
    setPhase("running");
  };

  const pressDigit = useCallback(
    (digit: string) => {
      if (phase !== "running" || tab !== "exercises") return;
      setInput((prev) => (prev.length < MAX_INPUT_LENGTH ? prev + digit : prev));
    },
    [phase, tab]
  );

  const backspace = useCallback(() => {
    if (phase !== "running" || tab !== "exercises") return;
    setInput((prev) => prev.slice(0, -1));
  }, [phase, tab]);
  const submit = useCallback(() => {
    if (phase !== "running" || tab !== "exercises" || input === "") return;

    const t = Date.now();
    const seconds = (t - questionStart) / 1000;
    const user = Number(input);
    const correct = user === answer;

    const newResults = [
      ...results,
      {
        a: table,
        b: current,
        user,
        correct,
        points: correct ? getPoints(seconds) : 0,
      },
    ];

    setResults(newResults);
    setInput("");

    if (newResults.length >= EXERCISES_COUNT) {
      setEndTime(t);
      setPhase("done");
    } else {
      setQuestionStart(t);
      setNow(t);
    }
  }, [phase, tab, input, questionStart, answer, results, table, current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) pressDigit(e.key);
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Enter") {
        e.preventDefault(); 
        submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pressDigit, backspace, submit]);

  const shownExercise = phase === "idle" ? 0 : Math.min(results.length + 1, EXERCISES_COUNT);
  const taskNumber = Math.max(shownExercise, 1);
  const feedback = getFeedback(score);
  const barWidth = phase === "running" ? Math.min(elapsed / MAX_SECONDS, 1) * 100 : 0;
  const barColor = phase === "running" ? getTimerColor(elapsed) : COLORS.green;

  return (
    <div className="trainer">
      {/* Шапка */}
      <header className="page-header">
        <div>
          <h1>Таблиця множення на {table}</h1>
          <p className="subtitle">
            Вправи · <b>Множення</b>
          </p>
        </div>
        <div className="pills">
          <span className="pill">Час: {formatTime(totalMs)}</span>
          <span className="pill">
            Завдання {taskNumber} / {EXERCISES_COUNT}
          </span>
        </div>
      </header>
      <nav className="tabs">
        <button
          type="button"
          className={`tab ${tab === "exercises" ? "active" : ""}`}
          onClick={() => setTab("exercises")}
        >
          Вправи
        </button>
        <button
          type="button"
          className={`tab ${tab === "instruction" ? "active" : ""}`}
          onClick={() => setTab("instruction")}
        >
          Інструкція
        </button>
      </nav>

      {tab === "instruction" ? (
        <section className="card instruction">
          <div className="card-head">
            <div className="card-title">
              <span className="dots">
                <i />
                <i />
              </span>
              Інструкція до вправ на таблицю множення на {table}
            </div>
            <span className="tag">Інструкція</span>
          </div>

          <ol>
            <li>Завдання складається із {EXERCISES_COUNT} прикладів</li>
            <li>
              Щоб розпочати виконання завдань, натисніть кнопку{" "}
              <span className="fake-btn">Розпочати</span>
            </li>
            <li>
              Щоб ввести відповідь, користуйтеся клавіатурою
              <div className="keypad demo">
                {KEYS.map((k) => (
                  <button key={k} type="button" tabIndex={-1}>
                    {k}
                  </button>
                ))}
                <button type="button" tabIndex={-1}>
                  0
                </button>
                <button type="button" tabIndex={-1} className="span-2">
                  ⌫
                </button>
              </div>
              або цифровими клавішами на ноутбуці/комп&apos;ютері
            </li>
            <li>
              Введіть відповідь і натисніть{" "}
              <span className="fake-btn">Наступний приклад</span> (або клавішу Enter)
              <p className="warning">
                <b>Увага!!!</b> При переході до нового завдання ви не зможете
                повернутися до попереднього, щоб змінити його значення!
              </p>
            </li>
            <li>
              Згенерується наступне завдання. Також ліворуч від клавіатури ви
              зможете побачити, чи правильно ви вирішили попереднє завдання, і
              набрані бали
            </li>
            <li>
              За правильно вирішене завдання ви отримаєте:
              <ul>
                <li>
                  10 балів, якщо ви витратили на рішення менше 10 секунд
                  (індикатор зелений <span className="dot" style={{ background: COLORS.green }} />)
                </li>
                <li>
                  9 балів, якщо ви витратили на рішення 10 – 15 секунд
                  (індикатор жовтий <span className="dot" style={{ background: COLORS.yellow }} />)
                </li>
                <li>
                  8 балів, якщо ви витратили на рішення 15 – 20 секунд
                  (індикатор помаранчевий <span className="dot" style={{ background: COLORS.orange }} />)
                </li>
                <li>
                  7 балів, якщо ви витратили на рішення більше 20 секунд
                  (червоний індикатор <span className="dot" style={{ background: COLORS.red }} />)
                </li>
              </ul>
            </li>
            <li>Після виконання {EXERCISES_COUNT} завдань ви побачите свій результат</li>
            <li>
              Можете спробувати покращити результат, натиснувши кнопку{" "}
              <span className="fake-btn">Спробувати ще раз</span>
            </li>
          </ol>
        </section>
      ) : (
        <section className="card">
          <div className="card-head">
            <div className="card-title">
              <span className="dots">
                <i />
                <i />
              </span>
              Завдання №{taskNumber}
            </div>
            <span className="tag">Таблиця на {table}</span>
          </div>

          {phase === "idle" && (
            <p className="hint">
              <b>Ти вже вивчив таблицю множення на {table}?</b> Розв&apos;язання
              задач і вправ — кращий спосіб перевірити свої знання і закріпити
              вивчений матеріал!
            </p>
          )}
          <div className="question">
            <span className="q-label">Обчисліть:</span>
            {phase === "done" ? (
              <span className="eq">Готово!</span>
            ) : (
              <>
                <span className="eq">
                  {table} · {phase === "idle" ? table : current} =
                </span>
                <span className={`answer-box ${phase === "running" ? "active" : ""}`}>
                  {phase === "idle" ? "?" : input || "\u00A0"}
                </span>
              </>
            )}
          </div>
          <div className="controls">
            <div className="stats">
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${barWidth || 1}%`, background: barColor }}
                />
              </div>
              <p>
                Вправи: <span className="blue">{shownExercise}</span> з{" "}
                <span className="red">{phase === "idle" ? 0 : EXERCISES_COUNT}</span>
              </p>
              <p>
                Результат: <span className="blue">{score}</span> балів
              </p>
              {lastResult && (
                <p className={lastResult.correct ? "blue" : "red"}>
                  {lastResult.correct ? "Вірно" : "Невірно"}: {lastResult.a} ·{" "}
                  {lastResult.b} = {lastResult.a * lastResult.b}
                </p>
              )}
            </div>

            <div className="keypad">
              {KEYS.map((k) => (
                <button key={k} type="button" onClick={() => pressDigit(k)}>
                  {k}
                </button>
              ))}
              <button type="button" onClick={() => pressDigit("0")}>
                0
              </button>
              <button type="button" className="span-2" onClick={backspace} aria-label="Стерти">
                ⌫
              </button>
            </div>
          </div>
          {phase === "done" && (
            <div className="summary">
              <p className="score-line">
                <b>Ваш результат:</b> {score} балів зі {EXERCISES_COUNT * 10}
              </p>
              <p>{feedback.text}</p>
              <div className="emoji">{feedback.emoji}</div>

              <ol className="answers">
                {results.map((r, i) => (
                  <li key={i} className={r.correct ? "ok" : "bad"}>
                    <span className="answer-status">
                      {i + 1}) {r.correct ? `Вірно (+${r.points})` : "Невірно"}
                    </span>
                    <span>
                      {r.a} · {r.b} ={" "}
                      {r.correct ? r.user : `${r.user} (вірно: ${r.a * r.b})`}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}
      <div className="actions">
        {tab === "exercises" && phase === "idle" && (
          <button type="button" className="btn-primary" onClick={start}>
            Розпочати
          </button>
        )}
        {tab === "exercises" && phase === "running" && (
          <button
            type="button"
            className="btn-primary"
            onClick={submit}
            disabled={input === ""}
          >
            {isLast ? "Завершити" : "Наступний приклад"}
          </button>
        )}
        {tab === "exercises" && phase === "done" && (
          <button type="button" className="btn-primary" onClick={start}>
            Спробувати ще раз
          </button>
        )}
        <Link href="/" className="btn-secondary">
          ← До вибору таблиці
        </Link>
      </div>
    </div>
  );
}

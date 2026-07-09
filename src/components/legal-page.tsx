import * as React from "react"

/**
 * Shared shell for the Privacy / Terms pages — a forced-light document on the
 * otherwise dark site, matching the original PrivacyPage.module.css.
 */

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-nav text-[#1a1a1a]">
      <div className="mx-auto max-w-[860px] px-6 pt-12 pb-[72px]">
        <header className="mb-12 border-b-2 border-primary/[0.12] pb-7">
          <h1 className="mb-2.5 text-[34px] leading-[1.2] font-extrabold tracking-[-0.02em] text-[#111827]">
            {title}
          </h1>
          <p className="text-[13px] font-semibold tracking-[0.06em] text-[#6b7280] uppercase">
            {lastUpdated}
          </p>
        </header>

        <div className="rounded-[18px] border border-[#e5e7eb] bg-white px-6 py-10 shadow-[0_4px_20px_rgba(17,24,39,0.05)] sm:px-14 sm:py-12">
          {children}
        </div>
      </div>
    </div>
  )
}

export function LegalIntro({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal-links mb-10 rounded-[10px] border-l-4 border-primary bg-primary/[0.045] px-[22px] py-[18px] text-base leading-[1.75] text-[#374151]">
      {children}
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="legal-links mb-11 border-b border-[#eceef1] pb-9 last:mb-0 last:border-0 last:pb-0">
      <h2 className="mb-[18px] flex items-center gap-2.5 text-[22px] font-bold tracking-[-0.01em] text-[#111827]">
        <span className="h-5 w-1 shrink-0 rounded-sm bg-primary" />
        {title}
      </h2>
      {children}
    </section>
  )
}

export function LegalSubsection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-[26px] last:mb-0">
      <h3 className="mb-2.5 text-[17px] font-bold tracking-[-0.005em] text-[#1f2937]">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function LegalText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[15px] leading-[1.75] text-[#374151] last:mb-0">
      {children}
    </p>
  )
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-2.5 list-disc pl-[22px] text-[15px] leading-[1.85] text-[#374151] marker:text-primary">
      {items.map((item, i) => (
        <li key={i} className="mb-2 pl-1 last:mb-0">
          {item}
        </li>
      ))}
    </ul>
  )
}

export function LegalTable({
  head,
  rows,
}: {
  head: [string, string]
  rows: [React.ReactNode, React.ReactNode][]
}) {
  return (
    <div className="my-4 overflow-x-auto rounded-[10px] border border-[#e5e7eb]">
      <table className="w-full border-collapse bg-white text-sm">
        <thead className="bg-[#f9fafb]">
          <tr>
            {head.map((cell) => (
              <th
                key={cell}
                className="border-b-2 border-[#e5e7eb] px-[18px] py-3.5 text-left text-xs font-bold tracking-[0.04em] text-[#4b5563] uppercase"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="transition-colors hover:bg-[#faf9ff]">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border-b border-[#f0f1f3] px-[18px] py-3.5 leading-[1.6] text-[#374151] last:border-b-0"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LegalContact({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal-links mt-4 rounded-[10px] border border-primary/10 bg-primary/[0.045] px-6 py-5 text-[15px] leading-[1.7] text-[#374151]">
      {children}
    </div>
  )
}

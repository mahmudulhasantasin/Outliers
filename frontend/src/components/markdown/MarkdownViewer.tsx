"use client";

import React from "react";
import {
  Check,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles
} from "lucide-react";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export default function MarkdownViewer({
  content,
  className = ""
}: MarkdownViewerProps) {
  // Render raw markdown parser
  const renderMarkdownContent = (raw: string) => {
    const lines = raw.split("\n");
    const elements: React.ReactNode[] = [];

    let inTable = false;
    let tableRows: string[][] = [];
    let inCodeBlock = false;
    let codeBlockLang = "";
    let codeLines: string[] = [];

    const flushTable = (key: string) => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        // filter out separator row (e.g. |---|---|)
        const bodyRows = tableRows.slice(1).filter(
          (row) => !row.every((cell) => /^[:\s-]+$/.test(cell))
        );

        elements.push(
          <div key={`table-${key}`} className="my-6 overflow-x-auto rounded-xl border border-[var(--text-primary)]/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--text-primary)]/15 bg-[var(--bg-surface)]">
                  {headerRow.map((cell, idx) => (
                    <th key={idx} className="p-3 font-semibold text-[var(--text-primary)]">
                      {formatInlineText(cell.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--text-primary)]/8">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[var(--text-primary)]/[0.02] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 text-[var(--text-primary)]/85 align-top">
                        {formatInlineText(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const flushCodeBlock = (key: string) => {
      if (inCodeBlock) {
        elements.push(
          <div
            key={`code-${key}`}
            className="my-5 rounded-xl border border-[var(--text-primary)]/15 bg-neutral-900 text-neutral-100 font-mono text-xs overflow-hidden shadow-inner"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-950/60 text-[11px] text-neutral-400">
              <span className="uppercase font-semibold tracking-wider text-[10px]">
                {codeBlockLang || "text"}
              </span>
              <span>GitHub README Diff</span>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed">
              <code>
                {codeLines.map((line, idx) => {
                  let lineClass = "text-neutral-300";
                  if (line.startsWith("+")) lineClass = "text-emerald-400 font-semibold bg-emerald-950/40 block -mx-4 px-4";
                  else if (line.startsWith("-")) lineClass = "text-rose-400 line-through opacity-80 bg-rose-950/40 block -mx-4 px-4";
                  return (
                    <span key={idx} className={lineClass}>
                      {line}
                      {"\n"}
                    </span>
                  );
                })}
              </code>
            </pre>
          </div>
        );
        codeLines = [];
        inCodeBlock = false;
        codeBlockLang = "";
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start/end
      if (line.trim().startsWith("```")) {
        if (!inCodeBlock) {
          flushTable(`before-code-${i}`);
          inCodeBlock = true;
          codeBlockLang = line.trim().slice(3).trim();
          codeLines = [];
        } else {
          flushCodeBlock(`end-code-${i}`);
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Table line (starts and ends with |)
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        inTable = true;
        const cells = line
          .trim()
          .slice(1, -1)
          .split("|");
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        flushTable(`flush-tbl-${i}`);
      }

      // Empty line
      if (line.trim() === "") {
        continue;
      }

      // Horizontal Rule
      if (line.trim() === "---" || line.trim() === "***") {
        elements.push(
          <hr
            key={`hr-${i}`}
            className="my-6 border-t border-[var(--text-primary)]/10"
          />
        );
        continue;
      }

      // GitHub Alert Callouts: > [!WARNING], > [!NOTE], > [!TIP], > [!CAUTION], > [!IMPORTANT]
      if (line.trim().startsWith("> [!")) {
        const alertType = line.trim().replace(/^>\s*\[!/, "").replace(/\]\s*$/, "").toUpperCase();
        // Collect following lines with >
        const alertLines: string[] = [];
        let j = i + 1;
        while (j < lines.length && lines[j].trim().startsWith(">")) {
          alertLines.push(lines[j].replace(/^>\s?/, ""));
          j++;
        }
        i = j - 1;

        let icon = <Info className="w-4 h-4 shrink-0" />;
        let alertBorder = "border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200";
        let titleColor = "text-blue-700 dark:text-blue-300";
        let title = "Note";

        if (alertType === "WARNING") {
          icon = <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />;
          alertBorder = "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100";
          titleColor = "text-amber-700 dark:text-amber-400";
          title = "Statutory Warning";
        } else if (alertType === "CAUTION") {
          icon = <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />;
          alertBorder = "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100";
          titleColor = "text-rose-700 dark:text-rose-400";
          title = "Statutory Risk";
        } else if (alertType === "TIP") {
          icon = <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />;
          alertBorder = "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100";
          titleColor = "text-emerald-700 dark:text-emerald-400";
          title = "Compliant Guidance";
        } else if (alertType === "IMPORTANT") {
          icon = <AlertCircle className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />;
          alertBorder = "border-purple-500/30 bg-purple-500/10 text-purple-950 dark:text-purple-100";
          titleColor = "text-purple-700 dark:text-purple-400";
          title = "Important Notice";
        }

        elements.push(
          <div
            key={`alert-${i}`}
            className={`my-4 p-4 rounded-xl border-l-4 ${alertBorder} flex flex-col gap-1.5`}
          >
            <div className={`flex items-center gap-2 font-semibold text-xs uppercase tracking-wider ${titleColor}`}>
              {icon}
              <span>{title}</span>
            </div>
            <div className="text-xs leading-relaxed opacity-90 pl-6">
              {alertLines.map((al, idx) => (
                <p key={idx} className={idx > 0 ? "mt-1" : ""}>
                  {formatInlineText(al)}
                </p>
              ))}
            </div>
          </div>
        );
        continue;
      }

      // Standard Blockquote: > text
      if (line.trim().startsWith(">")) {
        const bqText = line.trim().replace(/^>\s?/, "");
        elements.push(
          <blockquote
            key={`bq-${i}`}
            className="my-3 pl-4 border-l-2 border-[var(--text-primary)]/30 text-xs italic text-[var(--text-primary)]/80"
          >
            {formatInlineText(bqText)}
          </blockquote>
        );
        continue;
      }

      // Headers: #, ##, ###, ####
      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={`h1-${i}`}
            className="text-2xl font-serif font-bold text-[var(--text-primary)] mt-6 mb-3 pb-2 border-b border-[var(--text-primary)]/10"
          >
            {formatInlineText(line.slice(2))}
          </h1>
        );
        continue;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="text-lg font-serif font-semibold text-[var(--text-primary)] mt-6 mb-2 pb-1.5 border-b border-[var(--text-primary)]/10"
          >
            {formatInlineText(line.slice(3))}
          </h2>
        );
        continue;
      }
      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-sm font-sans font-bold text-[var(--text-primary)] mt-5 mb-2"
          >
            {formatInlineText(line.slice(4))}
          </h3>
        );
        continue;
      }

      // Checklists: - [x] or - [ ]
      if (/^-\s*\[([ xX])\]\s*(.*)$/.test(line.trim())) {
        const match = line.trim().match(/^-\s*\[([ xX])\]\s*(.*)$/);
        if (match) {
          const isChecked = match[1].toLowerCase() === "x";
          const checkText = match[2];
          elements.push(
            <div key={`check-${i}`} className="flex items-start gap-2.5 my-1 text-xs text-[var(--text-primary)]/90">
              <span className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                isChecked
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-[var(--text-primary)]/30 bg-[var(--bg-surface)]"
              }`}>
                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
              </span>
              <span>{formatInlineText(checkText)}</span>
            </div>
          );
          continue;
        }
      }

      // Bullet List item: - or *
      if (/^[\-\*]\s+(.*)$/.test(line.trim())) {
        const match = line.trim().match(/^[\-\*]\s+(.*)$/);
        if (match) {
          elements.push(
            <li key={`li-${i}`} className="text-xs text-[var(--text-primary)]/90 ml-4 list-disc my-1 leading-relaxed">
              {formatInlineText(match[1])}
            </li>
          );
          continue;
        }
      }

      // Standard Paragraph
      elements.push(
        <p key={`p-${i}`} className="text-xs text-[var(--text-primary)]/90 my-2 leading-relaxed">
          {formatInlineText(line)}
        </p>
      );
    }

    if (inTable) flushTable("end-table");
    if (inCodeBlock) flushCodeBlock("end-code");

    return elements;
  };

  // Helper for inline markdown: **bold**, `code`, links
  const formatInlineText = (text: string) => {
    // split by code `...`
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[11px] bg-[var(--bg-surface)] border border-[var(--text-primary)]/10 text-rose-600 dark:text-rose-400"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-[var(--text-primary)]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`p-6 md:p-10 rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)] shadow-sm font-sans leading-relaxed ${className}`}
    >
      <div className="max-w-4xl mx-auto space-y-1">
        {renderMarkdownContent(content)}
      </div>
    </div>
  );
}

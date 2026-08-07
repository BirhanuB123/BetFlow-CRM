export type PrintMetric = {
  label: string;
  value: string | number;
  detail?: string;
};

export type PrintReportOptions = {
  title: string;
  subtitle?: string;
  metrics?: PrintMetric[];
  columns: string[];
  rows: (string | number)[][];
};

export function printReportDocument(options: PrintReportOptions) {
  const { title, subtitle, metrics = [], columns, rows } = options;
  const dateStr = new Date().toLocaleDateString(undefined, {
    dateStyle: "full",
  });
  const timeStr = new Date().toLocaleTimeString(undefined, {
    timeStyle: "short",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Printable Report</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-b: 2px solid #6366f1;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .title { font-size: 22px; font-weight: 800; color: #1e1b4b; margin: 0 0 4px 0; }
    .subtitle { font-size: 13px; color: #475569; margin: 0; }
    .meta { text-align: right; font-size: 11px; color: #64748b; }
    .brand { font-size: 14px; font-weight: 700; color: #4f46e5; margin-bottom: 2px; }
    
    .toolbar {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 20px;
    }
    .btn {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
    }
    .btn-primary {
      background: #4f46e5;
      color: #ffffff;
      border: none;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }
    .metric-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      background: #f8fafc;
    }
    .metric-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    .metric-value { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .metric-detail { font-size: 11px; color: #64748b; margin-top: 2px; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 11px 14px;
      font-size: 12px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:nth-child(even) td { background: #fafafa; }
    
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }

    @media print {
      .toolbar { display: none !important; }
      body { padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <button class="btn" onclick="window.close()">Close Window</button>
  </div>

  <div class="header">
    <div>
      <h1 class="title">${title}</h1>
      ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
    </div>
    <div class="meta">
      <div class="brand">BetFlow CRM</div>
      <div>Generated: ${dateStr} at ${timeStr}</div>
      <div>Confidential System Document</div>
    </div>
  </div>

  ${
    metrics.length > 0
      ? `<div class="metrics-grid">
      ${metrics
        .map(
          (m) => `
        <div class="metric-card">
          <div class="metric-label">${m.label}</div>
          <div class="metric-value">${m.value}</div>
          ${m.detail ? `<div class="metric-detail">${m.detail}</div>` : ""}
        </div>
      `,
        )
        .join("")}
    </div>`
      : ""
  }

  <table>
    <thead>
      <tr>
        ${columns.map((c) => `<th>${c}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (r) => `
        <tr>
          ${r.map((cell) => `<td>${cell}</td>`).join("")}
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    <span>BetFlow Real Estate CRM — Official System Analytics</span>
    <span>Page 1 of 1</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

  // Open in a new clean browser window/tab where native print preview is 100% supported
  const printWin = window.open(
    "",
    "_blank",
    "width=960,height=800,scrollbars=yes",
  );
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
  } else {
    // If popup blocked, create hidden printable iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }
  }
}

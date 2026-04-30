"use client";

function dateStamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "-").trim();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportToWord(text: string, kandidaatNaam: string) {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const paragraphs = text.split(/\n/).map(
    (line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
  );

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `Voorstel-${safeFileName(kandidaatNaam)}-${dateStamp()}.docx`;
  triggerDownload(blob, filename);
}

export async function exportToPdf(text: string, kandidaatNaam: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const wrapped = doc.splitTextToSize(text, maxLineWidth);
  let y = margin;
  for (const line of wrapped) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  const filename = `Voorstel-${safeFileName(kandidaatNaam)}-${dateStamp()}.pdf`;
  doc.save(filename);
}

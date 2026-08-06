import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { createHash } from 'crypto';

export interface PdfContractData {
  contractId: string;
  contractNumber?: string;
  projectName: string;
  buildingName: string;
  unitNumber: string;
  unitType: string;
  floorName?: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  agreedPrice: number;
  currency: 'ETB' | 'USD';
  discountPercent?: number;
  specialTerms?: string;
  status: string;
  createdAt: Date | string;
  signatures?: Array<{
    signerName: string;
    signerRole: string;
    signerEmail?: string | null;
    signatureDataUrl: string;
    ipAddress: string;
    userAgent: string;
    verificationHash: string;
    signedAt: Date | string;
  }>;
}

@Injectable()
export class PdfGeneratorService {
  /**
   * Generates a branded legal contract PDF as a Buffer.
   */
  async generateContractPdf(data: PdfContractData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Contract_${data.contractNumber || data.contractId}`,
          Author: 'BetFlow CRM Engine',
          Subject: 'Real Estate Sales Agreement',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#1e3a8a'; // Deep Navy
      const darkColor = '#0f172a';
      const textMuted = '#475569';
      const accentBg = '#f8fafc';
      const borderColor = '#cbd5e1';

      // ─── Header Band ───────────────────────────────────────────────────────
      doc.rect(40, 40, 515, 65).fill(primaryColor);

      doc
        .fillColor('#ffffff')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('BETFLOW REAL ESTATE DEVELOPMENT S.C.', 55, 52);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#93c5fd')
        .text('Addis Ababa, Ethiopia  |  Official Legal Sales Agreement', 55, 78);

      // ─── Document Title ────────────────────────────────────────────────────
      doc.moveDown(3);
      doc
        .fillColor(darkColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('PROPERTY SALE & PURCHASE AGREEMENT', 40, 120, { align: 'center' });

      doc
        .fontSize(10)
        .font('Helvetica-Oblique')
        .fillColor(textMuted)
        .text('የውልና ማስረጃ ውል ስምምነት', 40, 138, { align: 'center' });

      doc
        .moveTo(40, 155)
        .lineTo(555, 155)
        .strokeColor(borderColor)
        .lineWidth(1)
        .stroke();

      // ─── Meta Details ──────────────────────────────────────────────────────
      const dateStr = new Date(data.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(textMuted)
        .text(`Agreement Date: ${dateStr}`, 40, 165)
        .text(`Contract ID: ${data.contractId}`, 350, 165, { align: 'right' });

      // ─── 1. Parties Section ────────────────────────────────────────────────
      doc.moveDown(1.5);
      const startY = 190;

      // Seller Box
      doc.rect(40, startY, 250, 80).fillAndStroke(accentBg, borderColor);
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('SELLER (DEVELOPER)', 50, startY + 10);

      doc
        .fillColor(darkColor)
        .fontSize(9)
        .font('Helvetica')
        .text('BetFlow Real Estate S.C.', 50, startY + 28)
        .text('Bole Medhanialem Tower, 8th Floor', 50, startY + 42)
        .text('Addis Ababa, Ethiopia', 50, startY + 56);

      // Buyer Box
      doc.rect(305, startY, 250, 80).fillAndStroke(accentBg, borderColor);
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('BUYER (PURCHASER)', 315, startY + 10);

      doc
        .fillColor(darkColor)
        .fontSize(9)
        .font('Helvetica')
        .text(data.buyerName, 315, startY + 28)
        .text(`Email: ${data.buyerEmail || 'N/A'}`, 315, startY + 42)
        .text(`Phone: ${data.buyerPhone || 'N/A'}`, 315, startY + 56);

      // ─── 2. Property & Financial Details Table ─────────────────────────────
      const tableY = startY + 95;

      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('PROPERTY & FINANCIAL SUMMARY', 40, tableY);

      doc.rect(40, tableY + 15, 515, 110).fillAndStroke(accentBg, borderColor);

      const col1 = 50;
      const col2 = 280;

      doc.fillColor(darkColor).fontSize(9.5);

      // Row 1
      doc
        .font('Helvetica-Bold')
        .text('Project Name:', col1, tableY + 25)
        .font('Helvetica')
        .text(data.projectName, col1 + 90, tableY + 25);

      doc
        .font('Helvetica-Bold')
        .text('Building & Floor:', col2, tableY + 25)
        .font('Helvetica')
        .text(`${data.buildingName} (${data.floorName || 'Standard Floor'})`, col2 + 95, tableY + 25);

      // Row 2
      doc
        .font('Helvetica-Bold')
        .text('Unit Number:', col1, tableY + 45)
        .font('Helvetica')
        .text(`Unit ${data.unitNumber} (${data.unitType})`, col1 + 90, tableY + 45);

      doc
        .font('Helvetica-Bold')
        .text('Agreed Price:', col2, tableY + 45)
        .font('Helvetica-Bold')
        .fillColor('#047857') // Emerald
        .text(`${data.agreedPrice.toLocaleString()} ${data.currency}`, col2 + 95, tableY + 45);

      // Row 3
      doc.fillColor(darkColor);
      doc
        .font('Helvetica-Bold')
        .text('Discount Applied:', col1, tableY + 65)
        .font('Helvetica')
        .text(`${data.discountPercent || 0}%`, col1 + 90, tableY + 65);

      doc
        .font('Helvetica-Bold')
        .text('Contract Status:', col2, tableY + 65)
        .font('Helvetica-Bold')
        .fillColor(data.status === 'SIGNED' ? '#047857' : '#b45309')
        .text(data.status, col2 + 95, tableY + 65);

      // Row 4
      doc.fillColor(darkColor);
      doc
        .font('Helvetica-Bold')
        .text('Payment Terms:', col1, tableY + 85)
        .font('Helvetica')
        .text('Standard Construction Milestone Schedule (Installments)', col1 + 90, tableY + 85);

      // ─── 3. Terms & Conditions ──────────────────────────────────────────────
      const termsY = tableY + 140;

      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('TERMS & STIPULATIONS', 40, termsY);

      doc
        .fillColor(darkColor)
        .fontSize(8.5)
        .font('Helvetica')
        .text(
          data.specialTerms ||
            '1. Ownership Handover: Handover of keys and certificate of title (Carta) shall be issued upon full completion of property price payment.\n' +
              '2. Construction Milestones: Payments are tied to verified structural milestones as specified in the master schedule.\n' +
              '3. Governance: This agreement is governed by the laws of the Federal Democratic Republic of Ethiopia.',
          40,
          termsY + 18,
          { width: 515, align: 'left', lineGap: 4 },
        );

      // ─── 4. Signatures & Audit Section ─────────────────────────────────────
      const sigY = termsY + 95;

      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('DIGITAL SIGNATURES & AUDIT VERIFICATION', 40, sigY);

      doc
        .moveTo(40, sigY + 15)
        .lineTo(555, sigY + 15)
        .strokeColor(borderColor)
        .stroke();

      const signatures = data.signatures || [];

      if (signatures.length > 0) {
        let currentSigY = sigY + 25;

        for (const sig of signatures) {
          doc.rect(40, currentSigY, 515, 65).fillAndStroke('#f1f5f9', '#94a3b8');

          // Signature Base64 Image
          if (sig.signatureDataUrl && sig.signatureDataUrl.startsWith('data:image/png;base64,')) {
            try {
              const imgBuffer = Buffer.from(
                sig.signatureDataUrl.replace(/^data:image\/png;base64,/, ''),
                'base64',
              );
              doc.image(imgBuffer, 50, currentSigY + 8, { fit: [120, 48] });
            } catch {
              doc
                .fontSize(9)
                .fillColor('#dc2626')
                .text('[Signature Image Error]', 50, currentSigY + 25);
            }
          }

          doc
            .fillColor(darkColor)
            .fontSize(9)
            .font('Helvetica-Bold')
            .text(`Signed by: ${sig.signerName} (${sig.signerRole})`, 180, currentSigY + 10);

          const sigDateStr = new Date(sig.signedAt).toLocaleString();

          doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor(textMuted)
            .text(`Timestamp: ${sigDateStr}`, 180, currentSigY + 24)
            .text(`IP Address: ${sig.ipAddress}  |  Agent: ${sig.userAgent.slice(0, 35)}...`, 180, currentSigY + 36);

          doc
            .fontSize(7.5)
            .font('Helvetica-Bold')
            .fillColor('#0369a1')
            .text(`SHA-256 Hash: ${sig.verificationHash.slice(0, 32)}...`, 180, currentSigY + 48);

          currentSigY += 75;
        }
      } else {
        // Render Blank Signature Lines
        const lineY = sigY + 50;

        doc
          .moveTo(50, lineY)
          .lineTo(240, lineY)
          .strokeColor(borderColor)
          .stroke();

        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor(darkColor)
          .text('Authorized Developer Representative', 50, lineY + 8);

        doc
          .moveTo(315, lineY)
          .lineTo(505, lineY)
          .strokeColor(borderColor)
          .stroke();

        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor(darkColor)
          .text(`Purchaser Signature (${data.buyerName})`, 315, lineY + 8);
      }

      // ─── Footer ────────────────────────────────────────────────────────────
      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor(textMuted)
        .text('Generated electronically by BetFlow CRM Audit System. Page 1 of 1', 40, 780, {
          align: 'center',
        });

      doc.end();
    });
  }

  /**
   * Helper to compute SHA-256 hash for audit trail verification.
   */
  computeSignatureHash(
    contractId: string,
    signerName: string,
    signedAt: string,
    ipAddress: string,
    signatureDataUrl: string,
  ): string {
    const raw = `${contractId}:${signerName}:${signedAt}:${ipAddress}:${signatureDataUrl.slice(-50)}`;
    return createHash('sha256').update(raw).digest('hex');
  }
}

import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { createHash } from 'crypto';
import * as QRCode from 'qrcode';

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
   * Generates a branded bilingual legal contract PDF with QR Code Audit Stamp as a Buffer.
   */
  async generateContractPdf(data: PdfContractData): Promise<Buffer> {
    const verificationUrl = process.env.APP_URL
      ? `${process.env.APP_URL}/contracts/verify/${data.contractId}`
      : `https://crm.betflow.et/contracts/verify/${data.contractId}`;

    let qrBuffer: Buffer | null = null;
    try {
      qrBuffer = await QRCode.toBuffer(verificationUrl, {
        width: 140,
        margin: 1,
        color: { dark: '#1e3a8a', light: '#ffffff' },
      });
    } catch {
      qrBuffer = null;
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Contract_${data.contractNumber || data.contractId}`,
          Author: 'BetFlow CRM Legal Engine',
          Subject: 'Bilingual Real Estate Sales Agreement (ውል ስምምነት)',
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
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('BETFLOW REAL ESTATE DEVELOPMENT S.C.', 55, 50);

      doc
        .fontSize(9.5)
        .font('Helvetica')
        .fillColor('#93c5fd')
        .text(
          'Addis Ababa, Ethiopia  |  Official Legal Sales Agreement',
          55,
          76,
        );

      // ─── Document Title ────────────────────────────────────────────────────
      doc.moveDown(3);
      doc
        .fillColor(darkColor)
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('REAL ESTATE SALE & PURCHASE AGREEMENT', 40, 118, {
          align: 'center',
        });

      doc
        .fontSize(9.5)
        .font('Helvetica-Oblique')
        .fillColor(textMuted)
        .text('Standard Property Sales Agreement (FDRE Civil Code Compliance)', 40, 134, { align: 'center' });

      doc
        .moveTo(40, 150)
        .lineTo(555, 150)
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
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor(textMuted)
        .text(`Agreement Date: ${dateStr}`, 40, 158)
        .text(`Contract ID: ${data.contractId}`, 350, 158, { align: 'right' });

      // ─── 1. Parties Section ────────────────────────────────────────────────
      const startY = 175;

      // Seller Box
      doc.rect(40, startY, 250, 75).fillAndStroke(accentBg, borderColor);
      doc
        .fillColor(primaryColor)
        .fontSize(9.5)
        .font('Helvetica-Bold')
        .text('SELLER (DEVELOPER)', 50, startY + 8);

      doc
        .fillColor(darkColor)
        .fontSize(8.5)
        .font('Helvetica')
        .text('BetFlow Real Estate S.C.', 50, startY + 24)
        .text('Bole Medhanialem Tower, 8th Floor', 50, startY + 38)
        .text('Addis Ababa, Ethiopia', 50, startY + 52);

      // Buyer Box
      doc.rect(305, startY, 250, 75).fillAndStroke(accentBg, borderColor);
      doc
        .fillColor(primaryColor)
        .fontSize(9.5)
        .font('Helvetica-Bold')
        .text('BUYER (PURCHASER)', 315, startY + 8);

      doc
        .fillColor(darkColor)
        .fontSize(8.5)
        .font('Helvetica')
        .text(data.buyerName, 315, startY + 24)
        .text(`Email: ${data.buyerEmail || 'N/A'}`, 315, startY + 38)
        .text(`Phone: ${data.buyerPhone || 'N/A'}`, 315, startY + 52);

      // ─── 2. Property & Financial Details Table ─────────────────────────────
      const tableY = startY + 85;

      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('PROPERTY & FINANCIAL SUMMARY', 40, tableY);

      doc.rect(40, tableY + 14, 515, 85).fillAndStroke(accentBg, borderColor);

      const col1 = 50;
      const col2 = 280;

      doc.fillColor(darkColor).fontSize(8.5);

      // Row 1
      doc
        .font('Helvetica-Bold')
        .text('Project Name:', col1, tableY + 22)
        .font('Helvetica')
        .text(data.projectName, col1 + 90, tableY + 22);

      doc
        .font('Helvetica-Bold')
        .text('Building & Floor:', col2, tableY + 22)
        .font('Helvetica')
        .text(
          `${data.buildingName} (${data.floorName || 'Standard Floor'})`,
          col2 + 95,
          tableY + 22,
        );

      // Row 2
      doc
        .font('Helvetica-Bold')
        .text('Unit Number:', col1, tableY + 40)
        .font('Helvetica')
        .text(
          `Unit ${data.unitNumber} (${data.unitType})`,
          col1 + 90,
          tableY + 40,
        );

      doc
        .font('Helvetica-Bold')
        .text('Agreed Price:', col2, tableY + 40)
        .font('Helvetica-Bold')
        .fillColor('#047857') // Emerald
        .text(
          `${data.agreedPrice.toLocaleString()} ${data.currency}`,
          col2 + 95,
          tableY + 40,
        );

      // Row 3
      doc.fillColor(darkColor);
      doc
        .font('Helvetica-Bold')
        .text('Discount Applied:', col1, tableY + 58)
        .font('Helvetica')
        .text(`${data.discountPercent || 0}%`, col1 + 90, tableY + 58);

      doc
        .font('Helvetica-Bold')
        .text('Contract Status:', col2, tableY + 58)
        .font('Helvetica-Bold')
        .fillColor(data.status === 'SIGNED' ? '#047857' : '#b45309')
        .text(data.status, col2 + 95, tableY + 58);

      // ─── 3. Terms & Stipulations ──────────────────────────────────────────
      const termsY = tableY + 110;

      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TERMS & LEGAL STIPULATIONS', 40, termsY);

      // Dual Column Boxes
      const colW = 250;
      doc.rect(40, termsY + 14, colW, 115).fillAndStroke('#fafafa', borderColor);
      doc.rect(305, termsY + 14, colW, 115).fillAndStroke('#fafafa', borderColor);

      // Left Column: Delivery & Ownership
      doc
        .fillColor(primaryColor)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('1. Delivery & Ownership Handover', 48, termsY + 20);

      doc
        .fillColor(darkColor)
        .fontSize(7.5)
        .font('Helvetica')
        .text(
          '• Title Deed (Carta) & key handover occurs upon 100% full payment settlement.\n' +
            '• Property inspection shall be conducted jointly prior to final key handover.\n' +
            '• Developer guarantees structural compliance according to master project designs.\n' +
            '• Governed under the laws of the Federal Democratic Republic of Ethiopia.',
          48,
          termsY + 34,
          { width: 234, align: 'left', lineGap: 3 },
        );

      // Right Column: Payment Milestones & Default
      doc
        .fillColor(primaryColor)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('2. Payment Milestones & Penalties', 313, termsY + 20);

      doc
        .fillColor(darkColor)
        .fontSize(7.5)
        .font('Helvetica')
        .text(
          '• Installment payments align with verified structural milestones (Slab, Plastering, Tiling).\n' +
            '• Overdue payments past the 15-day grace period incur late penalty rates as stipulated.\n' +
            '• Early payment discounts apply as agreed in the signed schedule.\n' +
            '• Disputed payments shall be resolved amicably through developer audit team.',
          313,
          termsY + 34,
          { width: 234, align: 'left', lineGap: 3 },
        );

      // ─── 4. Signatures & QR Code Verification Section ──────────────────────
      const sigY = termsY + 140;

      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('E-SIGNATURES & DYNAMIC QR CODE AUDIT STAMP', 40, sigY);

      doc
        .moveTo(40, sigY + 14)
        .lineTo(555, sigY + 14)
        .strokeColor(borderColor)
        .stroke();

      const signatures = data.signatures || [];

      if (signatures.length > 0) {
        let currentSigY = sigY + 22;

        for (const sig of signatures) {
          doc
            .rect(40, currentSigY, 390, 68)
            .fillAndStroke('#f1f5f9', '#94a3b8');

          // Signature Base64 Image
          if (
            sig.signatureDataUrl &&
            sig.signatureDataUrl.startsWith('data:image/png;base64,')
          ) {
            try {
              const imgBuffer = Buffer.from(
                sig.signatureDataUrl.replace(/^data:image\/png;base64,/, ''),
                'base64',
              );
              doc.image(imgBuffer, 48, currentSigY + 8, { fit: [110, 48] });
            } catch {
              doc
                .fontSize(8.5)
                .fillColor('#dc2626')
                .text('[Signature Image Error]', 48, currentSigY + 25);
            }
          }

          doc
            .fillColor(darkColor)
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .text(
              `Signed by: ${sig.signerName} (${sig.signerRole})`,
              170,
              currentSigY + 8,
            );

          const sigDateStr = new Date(sig.signedAt).toLocaleString();

          doc
            .fontSize(7.5)
            .font('Helvetica')
            .fillColor(textMuted)
            .text(`Timestamp: ${sigDateStr}`, 170, currentSigY + 22)
            .text(
              `IP Address: ${sig.ipAddress}  |  Device: ${sig.userAgent.slice(0, 30)}...`,
              170,
              currentSigY + 34,
            );

          doc
            .fontSize(7)
            .font('Helvetica-Bold')
            .fillColor('#0369a1')
            .text(
              `SHA-256 Hash: ${sig.verificationHash.slice(0, 32)}...`,
              170,
              currentSigY + 48,
            );

          // Embedded Dynamic QR Code Audit Stamp Box
          doc
            .rect(440, currentSigY, 115, 68)
            .fillAndStroke('#f0f9ff', '#0284c7');

          if (qrBuffer) {
            try {
              doc.image(qrBuffer, 465, currentSigY + 4, { fit: [45, 45] });
            } catch {
              // Graceful fallback
            }
          }

          doc
            .fillColor('#0369a1')
            .fontSize(6.5)
            .font('Helvetica-Bold')
            .text('SCAN TO VERIFY', 440, currentSigY + 52, {
              width: 115,
              align: 'center',
            });

          currentSigY += 76;
        }
      } else {
        // Render Blank Signature Lines & QR Audit Stamp Box
        const lineY = sigY + 45;

        doc
          .moveTo(40, lineY)
          .lineTo(210, lineY)
          .strokeColor(borderColor)
          .stroke();

        doc
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .fillColor(darkColor)
          .text('Authorized Developer Representative', 40, lineY + 6);

        doc
          .moveTo(240, lineY)
          .lineTo(420, lineY)
          .strokeColor(borderColor)
          .stroke();

        doc
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .fillColor(darkColor)
          .text(`Purchaser (${data.buyerName})`, 240, lineY + 6);

        // QR Code Verification Box for un-signed draft
        doc.rect(440, sigY + 22, 115, 68).fillAndStroke('#f0f9ff', '#0284c7');

        if (qrBuffer) {
          try {
            doc.image(qrBuffer, 465, sigY + 26, { fit: [45, 45] });
          } catch {
            // Graceful fallback
          }
        }

        doc
          .fillColor('#0369a1')
          .fontSize(6.5)
          .font('Helvetica-Bold')
          .text('SCAN TO VERIFY AUDIT', 440, sigY + 74, {
            width: 115,
            align: 'center',
          });
      }

      // ─── Footer ────────────────────────────────────────────────────────────
      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor(textMuted)
        .text(
          'Electronically generated & timestamped by BetFlow Real Estate CRM Legal Engine. Page 1 of 1',
          40,
          780,
          {
            align: 'center',
          },
        );

      doc.end();
    });
  }

  /**
   * Helper to compute SHA-256 hash for audit trail verification.
   */
  computeSignatureHash(
    contractId: string,
    signerName: string,
    signerRole: string,
    signedAt: string,
    ipAddress: string,
    userAgent: string,
    signatureDataUrl: string,
  ): string {
    const signatureChecksum = createHash('sha256')
      .update(signatureDataUrl || '')
      .digest('hex');
    const rawPayload = `BETFLOW_AUDIT_V2|contract:${contractId}|signer:${signerName}|role:${signerRole}|time:${signedAt}|ip:${ipAddress}|ua:${userAgent}|sigHash:${signatureChecksum}`;
    return createHash('sha256').update(rawPayload).digest('hex');
  }
}

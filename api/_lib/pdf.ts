import PDFDocument from 'pdfkit';
import type { NumerologyProfile } from './numerologyServer';

export interface PdfBuildArgs {
  title: string;
  reportText: string;
  profile: NumerologyProfile;
  language?: string;
}

// Convert markdown-ish text into pdfkit blocks.
// Supports: ## H2, ### H3, **bold**, *italic*, blank lines, lists.
export async function buildReportPdf(args: PdfBuildArgs): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        info: { Title: args.title, Author: 'Numerology Reading' },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cover header
      doc.font('Helvetica-Bold').fontSize(28).fillColor('#111')
        .text(args.title, { align: 'center' });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(11).fillColor('#666')
        .text(`Personalized for ${args.profile.fullName}`, { align: 'center' });
      doc.text(`Birth date: ${args.profile.birthDate}`, { align: 'center' });
      doc.moveDown(0.3);

      // Profile summary box
      doc.fontSize(10).fillColor('#444');
      const summary = [
        `Life Path: ${args.profile.lifePath}${args.profile.isMaster ? ' ★' : ''}`,
        `Soul: ${args.profile.soul}`,
        `Personality: ${args.profile.personality}`,
        `Expression: ${args.profile.expression}`,
        `Personal Year: ${args.profile.personalYear}`,
      ].join('   •   ');
      doc.text(summary, { align: 'center' });

      doc.moveDown(1.2);
      doc.strokeColor('#ccc').lineWidth(0.5)
        .moveTo(60, doc.y).lineTo(535, doc.y).stroke();
      doc.moveDown(1);

      // Body
      const lines = args.reportText.replace(/\r\n/g, '\n').split('\n');
      for (const raw of lines) {
        const line = raw.trimEnd();

        if (line.startsWith('### ')) {
          doc.moveDown(0.3);
          doc.font('Helvetica-Bold').fontSize(13).fillColor('#222')
            .text(line.slice(4));
          doc.moveDown(0.2);
          continue;
        }
        if (line.startsWith('## ')) {
          doc.moveDown(0.6);
          doc.font('Helvetica-Bold').fontSize(16).fillColor('#111')
            .text(line.slice(3));
          doc.moveDown(0.3);
          continue;
        }
        if (line.startsWith('# ')) {
          doc.moveDown(0.8);
          doc.font('Helvetica-Bold').fontSize(20).fillColor('#000')
            .text(line.slice(2));
          doc.moveDown(0.4);
          continue;
        }
        if (line === '') {
          doc.moveDown(0.5);
          continue;
        }
        if (/^\s*[-*•]\s+/.test(line)) {
          doc.font('Helvetica').fontSize(11).fillColor('#222')
            .text(`•  ${line.replace(/^\s*[-*•]\s+/, '')}`, {
              indent: 12,
              paragraphGap: 2,
            });
          continue;
        }

        // Strip simple **bold** / *italic* markers (pdfkit can't inline-style trivially)
        const cleaned = line
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/__(.+?)__/g, '$1')
          .replace(/\*(.+?)\*/g, '$1');

        doc.font('Helvetica').fontSize(11).fillColor('#222')
          .text(cleaned, { align: 'justify', paragraphGap: 4, lineGap: 2 });
      }

      // Footer
      doc.moveDown(2);
      doc.font('Helvetica-Oblique').fontSize(9).fillColor('#888')
        .text(
          'This report was personally generated for you. ' +
            'Numerology Reading · numerology.reading@dresstyle.world',
          { align: 'center' },
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

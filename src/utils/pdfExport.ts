/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - PDF Export Engine using jsPDF & html2canvas
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  fileName?: string;
  onProgress?: (status: string) => void;
}

/**
 * Exports an HTML element as an organized high-resolution A4 PDF document
 */
export async function exportElementToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<boolean> {
  const { fileName = 'تقرير_مختبر_الميكاترونكس_اليمني.pdf', onProgress } = options;

  try {
    onProgress?.('جاري تحضير المستند ورسم العناصر...');

    // Save previous scroll position
    const scrollPos = window.scrollY;

    // Render HTML container to high-res canvas (scale 2 gives crisp print quality)
    onProgress?.('جاري معالجة النصوص العربية والمخطط الهندسي...');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
    });

    // Restore scroll
    window.scrollTo(0, scrollPos);

    onProgress?.('جاري إنشاء صفحات ملف الـ PDF...');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // ~210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // ~297 mm
    const margin = 10; // 10 mm margin
    const contentWidth = pdfWidth - margin * 2; // 190 mm

    // Aspect ratio calculations
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const totalPdfHeight = (canvasHeight * contentWidth) / canvasWidth;

    const pageContentHeight = pdfHeight - margin * 2;

    if (totalPdfHeight <= pageContentHeight) {
      // Fits in a single page
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, totalPdfHeight);
    } else {
      // Multi-page document
      let remainingHeight = canvasHeight;
      let sourceY = 0;
      let pageNumber = 1;

      // Calculate slice height in canvas pixels that corresponds to one PDF page
      const sliceHeightInCanvas = (pageContentHeight * canvasWidth) / contentWidth;

      while (remainingHeight > 0) {
        if (pageNumber > 1) {
          pdf.addPage();
        }

        const currentSliceHeight = Math.min(remainingHeight, sliceHeightInCanvas);

        // Create an offscreen canvas for the current page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = currentSliceHeight;
        const pageCtx = pageCanvas.getContext('2d');

        if (pageCtx) {
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, canvasWidth, currentSliceHeight);
          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvasWidth,
            currentSliceHeight,
            0,
            0,
            canvasWidth,
            currentSliceHeight
          );

          const slicePdfHeight = (currentSliceHeight * contentWidth) / canvasWidth;
          const sliceImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(sliceImgData, 'JPEG', margin, margin, contentWidth, slicePdfHeight);
        }

        sourceY += currentSliceHeight;
        remainingHeight -= currentSliceHeight;
        pageNumber++;
      }
    }

    onProgress?.('جاري تنزيل الملف...');
    pdf.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to export PDF:', err);
    throw err;
  }
}

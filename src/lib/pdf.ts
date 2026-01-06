'use client'

/**
 * PDF Export Utility
 * Uses browser's native print functionality for clean PDF generation
 */

interface PDFExportOptions {
    title: string
    content: string
    date?: string
    author?: string
    footer?: string
}

/**
 * Generate a print-friendly document for PDF export
 */
export function exportToPDF(options: PDFExportOptions): void {
    const { title, content, date = new Date().toLocaleDateString('id-ID'), author, footer } = options

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
        alert('Popup blocked. Please allow popups for this site.')
        return
    }

    // Generate HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563eb;
        }
        
        .header h1 {
          font-size: 24px;
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .header .meta {
          font-size: 14px;
          color: #666;
        }
        
        .content {
          margin-bottom: 40px;
        }
        
        .content h2 {
          font-size: 18px;
          color: #1e40af;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        
        .content p {
          margin-bottom: 10px;
          text-align: justify;
        }
        
        .content ul, .content ol {
          margin-left: 20px;
          margin-bottom: 10px;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="meta">
          <p>Tanggal: ${date}</p>
          ${author ? `<p>Penyusun: ${author}</p>` : ''}
        </div>
      </div>
      
      <div class="content">
        ${content}
      </div>
      
      ${footer ? `<div class="footer">${footer}</div>` : ''}
      
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Cetak / Simpan PDF
        </button>
      </div>
    </body>
    </html>
  `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Auto-trigger print after a short delay
    setTimeout(() => {
        printWindow.print()
    }, 500)
}

/**
 * Format notulensi for PDF export
 */
export function formatNotulensiForPDF(notulensi: {
    judul: string
    tanggal: string
    jenis: string
    peserta: string
    isi: string
    kesimpulan?: string
    status: string
}): string {
    return `
    <h2>Informasi Rapat</h2>
    <p><strong>Jenis:</strong> ${notulensi.jenis}</p>
    <p><strong>Peserta:</strong> ${notulensi.peserta}</p>
    <p><strong>Status:</strong> ${notulensi.status}</p>
    
    <h2>Isi Notulensi</h2>
    <p>${notulensi.isi.replace(/\n/g, '<br/>')}</p>
    
    ${notulensi.kesimpulan ? `
      <h2>Kesimpulan</h2>
      <p>${notulensi.kesimpulan.replace(/\n/g, '<br/>')}</p>
    ` : ''}
  `
}

/**
 * Export notulensi to PDF
 */
export function exportNotulensiToPDF(notulensi: {
    judul: string
    tanggal: string
    jenis: string
    peserta: string
    isi: string
    kesimpulan?: string
    status: string
}): void {
    exportToPDF({
        title: notulensi.judul,
        content: formatNotulensiForPDF(notulensi),
        date: new Date(notulensi.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        author: 'Keuskupan Surabaya',
        footer: '© ' + new Date().getFullYear() + ' Dashboard Uskup Surabaya'
    })
}

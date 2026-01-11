
import { Document, Packer, Paragraph, TextRun, AlignmentType, Header, Footer, ImageRun, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx'

export interface KopConfig {
  nama: string
  alamat: string
  kontak: string
}

interface SuratData {
  nomor: string
  jenis: string
  judul: string
  tanggal: string
  pengirim: string
  penerima: string
  isi: string
  prioritas: string
  status: string
  creatorName: string
  kopConfig?: KopConfig
}

export async function generateSuratDocx(data: SuratData): Promise<Buffer> {
  const defaultNama = 'KEUSKUPAN SURABAYA'
  const defaultAlamat = 'Jalan Polisi Istimewa 15, Surabaya 60265'
  const defaultKontak = 'Telp. (031) 5678910 | Email: sekretariat@keuskupan-sby.or.id'

  const kopNama = data.kopConfig?.nama || defaultNama
  const kopAlamat = data.kopConfig?.alamat || defaultAlamat
  const kopKontak = data.kopConfig?.kontak || defaultKontak

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: kopNama,
                    bold: true,
                    size: 28, // 14pt
                    font: "Arial"
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: kopAlamat,
                    size: 20, // 10pt
                    font: "Arial"
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: kopKontak,
                    size: 20,
                    font: "Arial"
                  }),
                ],
                alignment: AlignmentType.CENTER,
                border: {
                  bottom: {
                    color: "000000",
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ text: "" }), // Spacer
          
          // Nomor & Tanggal
          new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
            borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
            },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: "Nomor: ", bold: true }),
                                        new TextRun(data.nomor)
                                    ]
                                })
                            ],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: data.tanggal }),
                                    ],
                                    alignment: AlignmentType.RIGHT,
                                })
                            ],
                        }),
                    ],
                }),
            ],
          }),

          new Paragraph({ text: "" }),

          // Perihal
          new Paragraph({
            children: [
              new TextRun({ text: "Perihal: ", bold: true }),
              new TextRun({ text: data.judul, bold: true }),
            ],
          }),

          new Paragraph({ text: "" }),

          // Tujuan
          new Paragraph({
            children: [
              new TextRun("Kepada Yth."),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: data.penerima, bold: true }),
            ],
          }),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Salam Pembuka
          new Paragraph({
            children: [
              new TextRun("Dengan hormat,"),
            ],
          }),

          new Paragraph({ text: "" }),

           // Isi Content - Naive HTML strip for now, user can edit formatting in Word
          ...data.isi.split('\n').map(line => 
            new Paragraph({
              children: [
                new TextRun(stripHtml(line))
              ]
            })
          ),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Tanda Tangan
          new Paragraph({
            children: [
               new TextRun("Hormat kami,"),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
               new TextRun("Keuskupan Surabaya"),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          new Paragraph({
            children: [
               new TextRun({
                 text: `( ${data.creatorName} )`,
                 bold: true,
                 underline: {}
               }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

function stripHtml(html: string) {
   return html.replace(/<[^>]*>?/gm, '');
}

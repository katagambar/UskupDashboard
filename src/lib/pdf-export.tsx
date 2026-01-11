/**
 * PDF Export for Surat
 * 
 * Server-side PDF generation using @react-pdf/renderer
 */

import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import React from 'react'

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  divider: {
    borderBottom: '2px solid #000',
    marginBottom: 20,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaItem: {
    fontSize: 10,
  },
  label: {
    fontWeight: 'bold',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  recipient: {
    marginBottom: 15,
  },
  content: {
    marginTop: 20,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  signature: {
    marginTop: 50,
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: 200,
    textAlign: 'center',
  },
  signatureName: {
    marginTop: 60,
    fontWeight: 'bold',
  },
  signatureTitle: {
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
  },
})

// ============================================
// TYPES
// ============================================

export interface KopConfig {
  nama: string
  alamat: string
  kontak: string
  logo?: string
}

export interface SuratPDFData {
  nomor: string
  jenis: string
  judul: string
  tanggal: string
  pengirim: string
  penerima: string
  isi?: string | null
  kopConfig?: KopConfig
  prioritas?: string
  status?: string
  creatorName?: string
}

// ============================================
// PDF DOCUMENT COMPONENT
// ============================================

function SuratDocument({ surat }: { surat: SuratPDFData }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return React.createElement(
    Document,
    { title: surat.judul, author: 'Keuskupan Surabaya' },
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.logo }, 'KEUSKUPAN SURABAYA'),
        React.createElement(Text, { style: styles.subtitle }, 'Jl. Kepanjen No. 4-6, Surabaya 60272'),
        React.createElement(Text, { style: styles.subtitle }, 'Telp: (031) 5347296 | Email: sekretariat@keuskupan-sby.or.id')
      ),
      React.createElement(View, { style: styles.divider }),
      // Metadata
      React.createElement(
        View,
        { style: styles.metadata },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.metaItem }, `Nomor: ${surat.nomor}`),
          React.createElement(Text, { style: styles.metaItem }, `Jenis: ${surat.jenis}`)
        ),
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.metaItem }, `Tanggal: ${formatDate(surat.tanggal)}`),
          React.createElement(Text, { style: styles.metaItem }, `Prioritas: ${surat.prioritas || 'Normal'}`)
        )
      ),
      // Title
      React.createElement(Text, { style: styles.title }, surat.judul),
      // Recipient
      React.createElement(
        View,
        { style: styles.recipient },
        React.createElement(Text, { style: styles.label }, 'Kepada Yth:'),
        React.createElement(Text, null, surat.penerima)
      ),
      // Content
      React.createElement(
        View,
        { style: styles.content },
        React.createElement(Text, null, surat.isi || 'Isi surat tidak tersedia.')
      ),
      // Signature
      React.createElement(
        View,
        { style: styles.signature },
        React.createElement(
          View,
          { style: styles.signatureBox },
          React.createElement(Text, null, 'Hormat kami,'),
          React.createElement(Text, { style: styles.signatureName }, surat.pengirim),
          React.createElement(Text, { style: styles.signatureTitle }, 'Keuskupan Surabaya')
        )
      ),
      // Footer
      React.createElement(
        Text,
        { style: styles.footer },
        `Dokumen ini dibuat oleh Dashboard Keuskupan Surabaya | ${new Date().toLocaleDateString('id-ID')}`
      )
    )
  )
}

// ============================================
// EXPORT FUNCTION
// ============================================

export async function generateSuratPDF(surat: SuratPDFData): Promise<Buffer> {
  const doc = (
    <Document title={surat.judul} author="Keuskupan Surabaya">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>KEUSKUPAN SURABAYA</Text>
          <Text style={styles.subtitle}>Jl. Kepanjen No. 4-6, Surabaya 60272</Text>
          <Text style={styles.subtitle}>Telp: (031) 5347296 | Email: sekretariat@keuskupan-sby.or.id</Text>
        </View>
        <View style={styles.divider} />
        
        {/* Metadata */}
        <View style={styles.metadata}>
          <View>
            <Text style={styles.metaItem}>Nomor: {surat.nomor}</Text>
            <Text style={styles.metaItem}>Jenis: {surat.jenis}</Text>
          </View>
          <View>
            <Text style={styles.metaItem}>Tanggal: {new Date(surat.tanggal).toLocaleDateString('id-ID')}</Text>
            <Text style={styles.metaItem}>Prioritas: {surat.prioritas || 'Normal'}</Text>
          </View>
        </View>
        
        {/* Title */}
        <Text style={styles.title}>{surat.judul}</Text>
        
        {/* Recipient */}
        <View style={styles.recipient}>
          <Text style={styles.label}>Kepada Yth:</Text>
          <Text>{surat.penerima}</Text>
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text>{surat.isi || 'Isi surat tidak tersedia.'}</Text>
        </View>
        
        {/* Signature */}
        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text>Hormat kami,</Text>
            <Text style={styles.signatureName}>{surat.pengirim}</Text>
            <Text style={styles.signatureTitle}>Keuskupan Surabaya</Text>
          </View>
        </View>
        
        {/* Footer */}
        <Text style={styles.footer}>
          Dokumen ini dibuat oleh Dashboard Keuskupan Surabaya | {new Date().toLocaleDateString('id-ID')}
        </Text>
      </Page>
    </Document>
  )
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(doc as any)
  return buffer
}


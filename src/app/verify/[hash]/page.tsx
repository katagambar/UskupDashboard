import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { verifySignature } from '@/lib/digital-signature'
import { CheckCircle, XCircle, AlertTriangle, FileText, User, Calendar, Shield } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Verifikasi Dokumen - Keuskupan Surabaya',
    description: 'Verifikasi keaslian dokumen digital Keuskupan Surabaya'
}

interface PageProps {
    params: Promise<{ hash: string }>
}

export default async function VerifyPage({ params }: PageProps) {
    const { hash } = await params

    if (!hash) {
        notFound()
    }

    const result = await verifySignature(hash)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/logo-keuskupan.jpg"
                            alt="Logo Keuskupan"
                            className="h-20 w-20 rounded-full object-cover shadow-lg"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Keuskupan Surabaya
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sistem Verifikasi Dokumen Digital
                    </p>
                </div>

                {/* Verification Result Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    {/* Status Header */}
                    <div className={`p-6 ${result.isValid
                            ? 'bg-green-500'
                            : result.revokedAt
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                        }`}>
                        <div className="flex items-center justify-center gap-3 text-white">
                            {result.isValid ? (
                                <>
                                    <CheckCircle className="h-10 w-10" />
                                    <div>
                                        <h2 className="text-xl font-bold">DOKUMEN VALID</h2>
                                        <p className="text-white/80 text-sm">Tanda tangan digital terverifikasi</p>
                                    </div>
                                </>
                            ) : result.revokedAt ? (
                                <>
                                    <AlertTriangle className="h-10 w-10" />
                                    <div>
                                        <h2 className="text-xl font-bold">DOKUMEN DICABUT</h2>
                                        <p className="text-white/80 text-sm">Tanda tangan telah dibatalkan</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-10 w-10" />
                                    <div>
                                        <h2 className="text-xl font-bold">TIDAK VALID</h2>
                                        <p className="text-white/80 text-sm">{result.error || 'Dokumen tidak ditemukan'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Document Details */}
                    {result.document && (
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Nomor Dokumen</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{result.document.nomor}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Judul</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{result.document.judul}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Dokumen</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{result.document.tanggal}</p>
                                </div>
                            </div>

                            {result.signer && (
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Ditandatangani oleh</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{result.signer.name}</p>
                                        <p className="text-sm text-gray-500">{result.signer.jabatan || result.signer.role}</p>
                                    </div>
                                </div>
                            )}

                            {result.signedAt && (
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Waktu Tanda Tangan</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {new Date(result.signedAt).toLocaleString('id-ID', {
                                                dateStyle: 'full',
                                                timeStyle: 'short'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {result.revokedAt && (
                                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <p className="text-sm text-orange-700 dark:text-orange-400">
                                        <strong>Dicabut pada:</strong> {new Date(result.revokedAt).toLocaleString('id-ID')}
                                    </p>
                                    {result.revokedReason && (
                                        <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
                                            <strong>Alasan:</strong> {result.revokedReason}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Verifikasi ID: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">{hash}</code>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            © {new Date().getFullYear()} Keuskupan Surabaya
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

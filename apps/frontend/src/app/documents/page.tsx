'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { apiClient } from '@/utils/api'

export default function DocumentsPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadMessage, setUploadMessage] = useState('')

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setUploadMessage('')
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        setUploadMessage('')

        try {
            const result = await apiClient.uploadDocument(selectedFile)
            setUploadMessage(`✅ Successfully indexed: ${result.filename} (${result.chunk_count} chunks)`)
            setSelectedFile(null)

            // Reset file input
            const fileInput = document.getElementById('file-input') as HTMLInputElement
            if (fileInput) fileInput.value = ''
        } catch (error) {
            setUploadMessage(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-blue-600 hover:text-blue-700">
                            ← Home
                        </Link>
                        <h1 className="text-xl font-semibold">Documents</h1>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
                    <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Upload documents to enable RAG-powered chat. Supported formats: TXT, MD, PDF (text only), code files.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="file-input"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Select File
                            </label>
                            <input
                                id="file-input"
                                type="file"
                                onChange={handleFileSelect}
                                accept=".txt,.md,.pdf,.py,.js,.ts,.jsx,.tsx,.json,.yaml,.yml"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={isUploading}
                            />
                        </div>

                        {selectedFile && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm">
                                    <span className="font-semibold">Selected:</span> {selectedFile.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Size: {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isUploading ? 'Uploading & Indexing...' : 'Upload & Index'}
                        </button>

                        {uploadMessage && (
                            <div className={`p-4 rounded-lg ${uploadMessage.startsWith('✅')
                                    ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200'
                                    : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
                                }`}>
                                {uploadMessage}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold mb-2">How it works:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                            <li>Upload your document (it will be chunked into semantic segments)</li>
                            <li>Each chunk is embedded using the configured LLM</li>
                            <li>Embeddings are stored in the vector database</li>
                            <li>Use the <Link href="/chat" className="text-blue-600 hover:underline">Chat</Link> to ask questions about your documents</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}

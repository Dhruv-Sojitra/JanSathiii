import React, { useState, useCallback } from 'react'
import { UploadCloud, FileText, CheckCircle2, ShieldAlert, Loader2, Search, Trash2 } from 'lucide-react'

export default function DocumentCenter() {
  const [isDragging, setIsDragging] = useState(false)
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Aadhaar_Card.pdf', type: 'Identity Proof', date: '2024-02-15', status: 'analyzed' },
    { id: 2, name: 'Income_Certificate_2024.pdf', type: 'Income Proof', date: '2024-03-02', status: 'analyzed' }
  ])
  const [uploading, setUploading] = useState(false)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    setUploading(true)
    setTimeout(() => {
      const newDoc = {
        id: Date.now(),
        name: files[0].name,
        type: 'Processing...',
        date: new Date().toISOString().split('T')[0],
        status: 'processing'
      }
      setDocuments(prev => [newDoc, ...prev])
      setUploading(false)
      
      setTimeout(() => {
        setDocuments(prev => prev.map(d => 
          d.id === newDoc.id ? { ...d, type: 'Address / Domicile Proof', status: 'analyzed' } : d
        ))
      }, 2500)
    }, 1200)
  }

  const handleDelete = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          Citizen Document Center
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Securely verify and manage your documents for hassle-free government scheme applications.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 flex gap-3 text-sm text-blue-800 dark:text-blue-300 mb-8 transition-colors">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="font-semibold mb-0.5">Privacy & Security First</p>
          <p className="text-xs sm:text-sm text-blue-800/90 dark:text-blue-300/90">
            Documents are verified locally or in isolated cloud sandbox to check application checklist readiness. Raw document contents are never sold or shared with 3rd parties.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-1">
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50' 
                : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <UploadCloud className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Upload Document</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Drag and drop your file here, or click to browse.</p>
            
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileInput}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label 
              htmlFor="file-upload" 
              className="btn-secondary w-full cursor-pointer inline-flex items-center justify-center py-2.5 text-sm"
            >
              Select File
            </label>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-4">Supported: PDF, JPEG, PNG (Max 10MB)</p>
          </div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/70 dark:bg-slate-800/60">
              <h3 className="font-bold text-gray-900 dark:text-white">Your Documents</h3>
              <span className="text-xs font-semibold bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-2.5 py-1 rounded-full">
                {documents.length} Files
              </span>
            </div>
            
            {documents.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-slate-400">
                <FileText className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                {documents.map((doc) => (
                  <li key={doc.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[200px] sm:max-w-xs">{doc.name}</p>
                        <div className="flex items-center gap-2.5 mt-1 text-xs">
                          <span className="text-gray-500 dark:text-slate-400">{doc.date}</span>
                          <span className={`px-2 py-0.5 rounded-md font-semibold ${
                            doc.status === 'analyzed' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                          }`}>
                            {doc.status === 'analyzed' ? doc.type : 'Analyzing...'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto flex items-center gap-2">
                      {doc.status === 'analyzed' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

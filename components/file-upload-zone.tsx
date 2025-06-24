"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadZoneProps {
  onFileUpload: (files: FileList) => void
  isUploading: boolean
}

export function FileUploadZone({ onFileUpload, isUploading }: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        setUploadStatus("error")
        setTimeout(() => setUploadStatus("idle"), 3000)
        return
      }

      if (acceptedFiles.length > 0) {
        const fileList = new DataTransfer()
        acceptedFiles.forEach((file) => fileList.items.add(file))
        onFileUpload(fileList.files)
        setUploadStatus("success")
        setTimeout(() => setUploadStatus("idle"), 3000)
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  })

  const getStatusIcon = () => {
    if (isUploading) {
      return (
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="h-12 w-12 text-gray-600 dark:text-slate-300" />
        </motion.div>
      )
    }
    if (uploadStatus === "success") {
      return <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
    }
    if (uploadStatus === "error") {
      return <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
    }
    return <FileSpreadsheet className="h-12 w-12 text-gray-400 dark:text-slate-500" />
  }

  const getStatusText = () => {
    if (isUploading) return "Processing Excel File..."
    if (uploadStatus === "success") return "Excel File Processed Successfully!"
    if (uploadStatus === "error") return "Upload Failed - Invalid File Type"
    return isDragActive ? "Drop your Excel files here..." : "Upload Excel Files"
  }

  const getStatusColor = () => {
    if (isUploading) return "text-gray-700 dark:text-slate-300"
    if (uploadStatus === "success") return "text-green-700 dark:text-green-400"
    if (uploadStatus === "error") return "text-red-700 dark:text-red-400"
    return isDragActive ? "text-gray-700 dark:text-slate-300" : "text-gray-600 dark:text-slate-400"
  }

  return (
    <motion.div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
        ${
          isDragActive
            ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
            : uploadStatus === "success"
              ? "border-green-500 bg-green-50 dark:bg-green-900/10"
              : uploadStatus === "error"
                ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                : "border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
        }
        ${isUploading ? "pointer-events-none opacity-70" : "hover:shadow-md"}
      `}
      whileHover={{ scale: isUploading ? 1 : 1.01 }}
      whileTap={{ scale: isUploading ? 1 : 0.97 }}
    >
      <input {...getInputProps()} />

      <div className="relative z-10 flex flex-col items-center space-y-4">
        {getStatusIcon()}
        <motion.h3 className={`text-lg font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </motion.h3>
        {uploadStatus === "idle" && (
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Drag & drop or click to upload (.xlsx, .xls)
          </p>
        )}
        {!isUploading && uploadStatus === "idle" && (
          <Button variant="outline" className="mt-2">
            <Upload className="h-4 w-4 mr-2" /> Choose Files
          </Button>
        )}
      </div>
    </motion.div>
  )
}
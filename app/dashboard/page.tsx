"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  FileSpreadsheet,
  BarChart3,
  Download,
  Settings,
  User,
  LogOut,
  Trash2,
  Eye,
  Moon,
  Sun,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ChartComponent } from "@/components/chart-component"
import { FileUploadZone } from "@/components/file-upload-zone"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { setSelectedFile, addFile, removeFile } from "@/lib/store/fileSlice"
import { setUser } from "@/lib/store/authSlice"
import { useTheme } from "next-themes"
import * as XLSX from "xlsx"

interface UploadedFile {
  id: string
  name: string
  size: number
  uploadDate: string
  status: "processing" | "completed" | "error"
  data?: any[]
  columns?: string[]
  rawData?: any[][]
  debugInfo?: any
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { files, selectedFile } = useAppSelector((state) => state.files)
  const { user } = useAppSelector((state) => state.auth)
  const { theme, setTheme } = useTheme()

  const [chartType, setChartType] = useState<string>("bar")
  const [xAxis, setXAxis] = useState<string>("")
  const [yAxis, setYAxis] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [debugMode, setDebugMode] = useState(true)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/auth/login"
      return
    }

    // Load user data
    const userData = localStorage.getItem("user")
    if (userData) {
      dispatch(setUser(JSON.parse(userData)))
    }
  }, [dispatch])

  const processExcelFile = async (file: File): Promise<{ data: any[]; columns: string[]; debugInfo: any }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          console.log("🔍 Starting Excel file processing...")
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })

          console.log("📊 Workbook info:", {
            sheetNames: workbook.SheetNames,
            totalSheets: workbook.SheetNames.length,
          })

          // Get the first worksheet
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          console.log("📋 Worksheet range:", worksheet["!ref"])

          // Method 1: Get raw data with different options
          const rawData1 = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: false,
          }) as any[][]

          const rawData2 = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: true,
          }) as any[][]

          const rawData3 = XLSX.utils.sheet_to_json(worksheet, {
            defval: null,
            raw: true,
          }) as any[]

          console.log("🔢 Raw data comparison:", {
            method1_raw_false: rawData1.slice(0, 3),
            method2_raw_true: rawData2.slice(0, 3),
            method3_object_format: rawData3.slice(0, 3),
          })

          // Use the raw=true version for better number preservation
          const rawData = rawData2

          if (rawData.length === 0) {
            reject(new Error("Empty Excel file"))
            return
          }

          // Extract headers from first row
          const headers = rawData[0]
            .map((header, index) => {
              if (header === null || header === undefined || header === "") {
                return `Column_${index + 1}`
              }
              return String(header).trim()
            })
            .filter((header, index) => {
              // Only include columns that have some data in the rows below
              const hasData = rawData.slice(1).some((row) => {
                const value = row[index]
                return value !== null && value !== undefined && value !== ""
              })
              return hasData
            })

          console.log("📝 Headers extracted:", headers)

          // Extract data rows (skip header row)
          const dataRows = rawData.slice(1).filter((row) => {
            // Filter out completely empty rows
            return row && row.some((cell) => cell !== null && cell !== undefined && cell !== "")
          })

          console.log("📊 Data rows found:", dataRows.length)

          // Convert to object format with detailed logging
          const processedData = dataRows.map((row, rowIndex) => {
            const obj: any = {}

            headers.forEach((header, colIndex) => {
              const originalValue = row[colIndex]
              const processedValue = originalValue

              // Log first few values for debugging
              if (rowIndex < 3) {
                console.log(`🔍 Row ${rowIndex}, Column "${header}":`, {
                  originalValue,
                  type: typeof originalValue,
                  isNull: originalValue === null,
                  isUndefined: originalValue === undefined,
                  isEmpty: originalValue === "",
                })
              }

              // Handle null/undefined/empty
              if (originalValue === null || originalValue === undefined || originalValue === "") {
                obj[header] = null
                return
              }

              // If it's already a number, keep it
              if (typeof originalValue === "number") {
                obj[header] = originalValue
                if (rowIndex < 3) {
                  console.log(`✅ Kept as number: ${originalValue}`)
                }
                return
              }

              // If it's a string, try to convert to number
              if (typeof originalValue === "string") {
                const trimmed = originalValue.trim()

                // Try direct number conversion first
                const directNumber = Number(trimmed)
                if (!isNaN(directNumber) && isFinite(directNumber)) {
                  obj[header] = directNumber
                  if (rowIndex < 3) {
                    console.log(`✅ Converted string "${trimmed}" to number: ${directNumber}`)
                  }
                  return
                }

                // Try removing common formatting characters
                const cleaned = trimmed.replace(/[$,%]/g, "")
                const cleanedNumber = Number(cleaned)
                if (!isNaN(cleanedNumber) && isFinite(cleanedNumber)) {
                  obj[header] = cleanedNumber
                  if (rowIndex < 3) {
                    console.log(`✅ Cleaned and converted "${trimmed}" to number: ${cleanedNumber}`)
                  }
                  return
                }

                // Keep as string if not convertible
                obj[header] = trimmed
                if (rowIndex < 3) {
                  console.log(`📝 Kept as string: "${trimmed}"`)
                }
                return
              }

              // For other types (boolean, date, etc.)
              obj[header] = originalValue
              if (rowIndex < 3) {
                console.log(`🔄 Kept original type (${typeof originalValue}): ${originalValue}`)
              }
            })

            return obj
          })

          // Analyze the processed data
          const columnAnalysis = headers.map((header) => {
            const values = processedData.map((row) => row[header]).filter((v) => v !== null && v !== undefined)
            const types = [...new Set(values.map((v) => typeof v))]
            const numericValues = values.filter((v) => typeof v === "number")
            const stringValues = values.filter((v) => typeof v === "string")

            return {
              column: header,
              totalValues: values.length,
              types,
              numericCount: numericValues.length,
              stringCount: stringValues.length,
              sampleValues: values.slice(0, 5),
              numericSamples: numericValues.slice(0, 3),
              stringSamples: stringValues.slice(0, 3),
            }
          })

          console.log("📈 Column Analysis:", columnAnalysis)

          const debugInfo = {
            originalSheetRange: worksheet["!ref"],
            totalRawRows: rawData.length,
            totalProcessedRows: processedData.length,
            headers,
            columnAnalysis,
            sampleProcessedData: processedData.slice(0, 3),
          }

          console.log("✅ Excel processing complete:", debugInfo)

          resolve({
            data: processedData,
            columns: headers,
            debugInfo,
          })
        } catch (error) {
          console.error("❌ Excel processing error:", error)
          reject(new Error(`Failed to process Excel file: ${error.message}`))
        }
      }

      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileUpload = useCallback(
    async (uploadedFiles: FileList) => {
      setIsUploading(true)

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]

        if (!file.name.match(/\.(xlsx|xls)$/)) {
          toast({
            title: "Invalid file type",
            description: "Please upload only Excel files (.xlsx or .xls)",
            variant: "destructive",
          })
          continue
        }

        const newFile: UploadedFile = {
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          uploadDate: new Date().toISOString(),
          status: "processing",
        }

        dispatch(addFile(newFile))

        try {
          console.log(`🚀 Processing file: ${file.name}`)
          const { data, columns, debugInfo } = await processExcelFile(file)

          const updatedFile = {
            ...newFile,
            status: "completed" as const,
            data: data,
            columns: columns,
            debugInfo: debugInfo,
          }

          dispatch(removeFile(newFile.id))
          dispatch(addFile(updatedFile))

          toast({
            title: "File processed successfully",
            description: `${file.name}: ${data.length} rows, ${columns.length} columns processed.`,
          })

          console.log(`✅ File processed successfully: ${file.name}`, {
            rows: data.length,
            columns: columns.length,
            debugInfo,
          })
        } catch (error) {
          console.error("❌ Error processing file:", error)

          const errorFile = {
            ...newFile,
            status: "error" as const,
          }

          dispatch(removeFile(newFile.id))
          dispatch(addFile(errorFile))

          toast({
            title: "File processing failed",
            description: error.message || "Failed to process the Excel file",
            variant: "destructive",
          })
        }
      }

      setIsUploading(false)
    },
    [toast, dispatch],
  )

  const handleFileSelect = (file: UploadedFile) => {
    console.log("📁 Selecting file:", file.name)
    dispatch(setSelectedFile(file))

    if (file.columns && file.columns.length > 0) {
      setXAxis(file.columns[0])

      // Find the best numeric column for Y-axis
      let bestNumericColumn = null
      let maxNumericCount = 0

      if (file.debugInfo?.columnAnalysis) {
        for (const analysis of file.debugInfo.columnAnalysis) {
          if (analysis.numericCount > maxNumericCount) {
            maxNumericCount = analysis.numericCount
            bestNumericColumn = analysis.column
          }
        }
      }

      const selectedY = bestNumericColumn || file.columns[1] || file.columns[0]
      setYAxis(selectedY)

      console.log("🎯 Axis selection:", {
        xAxis: file.columns[0],
        yAxis: selectedY,
        numericColumnsFound: file.debugInfo?.columnAnalysis?.filter((a) => a.numericCount > 0).length || 0,
      })
    }
  }

  const handleDeleteFile = (fileId: string) => {
    dispatch(removeFile(fileId))
    if (selectedFile?.id === fileId) {
      dispatch(setSelectedFile(null))
    }
    toast({
      title: "File deleted",
      description: "File has been removed from your dashboard.",
    })
  }

  const handleDownloadChart = (format: "png" | "pdf") => {
    toast({
      title: "Download started",
      description: `Chart is being downloaded as ${format.toUpperCase()}.`,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/auth/login"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-200 to-zinc-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      {/* Shady Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-gray-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 rounded-full mix-blend-multiply filter blur-xl opacity-40 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-zinc-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-40 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-r from-slate-400 to-zinc-500 dark:from-zinc-600 dark:to-zinc-700 rounded-full mix-blend-multiply filter blur-xl opacity-40 dark:opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg transition-colors duration-300 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
                    Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-slate-400 text-sm transition-colors duration-300">
                    Excel Analytics Platform
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDebugMode(!debugMode)}
                  className="text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Debug: {debugMode ? "ON" : "OFF"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  {user?.name || "Profile"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-300"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* File Upload and Management */}
            <div className="lg:col-span-1 space-y-6">
              {/* Upload Zone */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-gray-300 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-white flex items-center transition-colors duration-300">
                      <Upload className="h-5 w-5 mr-2 text-gray-600" />
                      Upload Excel Files
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-slate-300 transition-colors duration-300">
                      Drag & drop or click to upload .xlsx or .xls files
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUploadZone onFileUpload={handleFileUpload} isUploading={isUploading} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* File List */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-gray-300 dark:border-slate-700 shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-white flex items-center transition-colors duration-300">
                      <FileSpreadsheet className="h-5 w-5 mr-2 text-slate-600" />
                      Uploaded Files ({files.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <AnimatePresence>
                        {files.map((file) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-3 rounded-lg border transition-all cursor-pointer ${
                              selectedFile?.id === file.id
                                ? "bg-gray-200 dark:bg-slate-700/50 border-gray-400 dark:border-slate-600"
                                : "bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700"
                            }`}
                            onClick={() => file.status === "completed" && handleFileSelect(file)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-800 dark:text-white text-sm font-medium truncate transition-colors duration-300">
                                  {file.name}
                                </p>
                                <p className="text-gray-500 dark:text-slate-400 text-xs transition-colors duration-300">
                                  {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                                  {file.data && ` • ${file.data.length} rows`}
                                  {file.debugInfo?.columnAnalysis && (
                                    <span className="text-green-600">
                                      {" "}
                                      • {file.debugInfo.columnAnalysis.filter((a) => a.numericCount > 0).length} numeric
                                      cols
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-2">
                                <Badge
                                  variant={
                                    file.status === "completed"
                                      ? "default"
                                      : file.status === "error"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {file.status}
                                </Badge>
                                {file.status === "completed" && (
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-300"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleFileSelect(file)
                                      }}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-300"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteFile(file.id)
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {files.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-slate-400 transition-colors duration-300">
                          <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No files uploaded yet</p>
                          <p className="text-sm">Upload Excel files to get started</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Chart Configuration and Visualization */}
            <div className="lg:col-span-2 space-y-6">
              {selectedFile ? (
                <>
                  {/* Debug Information */}
                  {debugMode && selectedFile.debugInfo && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                        <CardHeader>
                          <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Debug Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm space-y-2">
                            <p>
                              <strong>Sheet Range:</strong> {selectedFile.debugInfo.originalSheetRange}
                            </p>
                            <p>
                              <strong>Raw Rows:</strong> {selectedFile.debugInfo.totalRawRows}
                            </p>
                            <p>
                              <strong>Processed Rows:</strong> {selectedFile.debugInfo.totalProcessedRows}
                            </p>
                            <div>
                              <strong>Column Analysis:</strong>
                              <div className="mt-2 space-y-1">
                                {selectedFile.debugInfo.columnAnalysis.map((col, idx) => (
                                  <div key={idx} className="text-xs bg-white dark:bg-slate-800 p-2 rounded">
                                    <span className="font-medium">{col.column}:</span> {col.totalValues} values,{" "}
                                    {col.numericCount} numeric, {col.stringCount} text
                                    <br />
                                    <span className="text-gray-600">
                                      Samples: {JSON.stringify(col.sampleValues.slice(0, 3))}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Chart Configuration */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-gray-300 dark:border-slate-700 shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-white flex items-center justify-between transition-colors duration-300">
                          <span className="flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2 text-zinc-600" />
                            Chart Configuration
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-300"
                              onClick={() => handleDownloadChart("png")}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              PNG
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-300"
                              onClick={() => handleDownloadChart("pdf")}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                          </div>
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-slate-300 transition-colors duration-300">
                          Configure your chart settings for {selectedFile.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-gray-700 dark:text-slate-300 text-sm font-medium mb-2 block transition-colors duration-300">
                              Chart Type
                            </label>
                            <Select value={chartType} onValueChange={setChartType}>
                              <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-white transition-colors duration-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                                <SelectItem value="bar">Bar Chart</SelectItem>
                                <SelectItem value="line">Line Chart</SelectItem>
                                <SelectItem value="pie">Pie Chart</SelectItem>
                                <SelectItem value="scatter">Scatter Plot</SelectItem>
                                <SelectItem value="doughnut">Doughnut Chart</SelectItem>
                                <SelectItem value="radar">Radar Chart</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-gray-700 dark:text-slate-300 text-sm font-medium mb-2 block transition-colors duration-300">
                              X-Axis
                            </label>
                            <Select value={xAxis} onValueChange={setXAxis}>
                              <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-white transition-colors duration-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                                {selectedFile.columns?.map((column) => {
                                  const analysis = selectedFile.debugInfo?.columnAnalysis?.find(
                                    (a) => a.column === column,
                                  )
                                  return (
                                    <SelectItem key={column} value={column}>
                                      {column}
                                      {analysis && (
                                        <span className="text-xs text-gray-500 ml-2">
                                          ({analysis.numericCount}n, {analysis.stringCount}s)
                                        </span>
                                      )}
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-gray-700 dark:text-slate-300 text-sm font-medium mb-2 block transition-colors duration-300">
                              Y-Axis
                            </label>
                            <Select value={yAxis} onValueChange={setYAxis}>
                              <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-white transition-colors duration-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                                {selectedFile.columns?.map((column) => {
                                  const analysis = selectedFile.debugInfo?.columnAnalysis?.find(
                                    (a) => a.column === column,
                                  )
                                  return (
                                    <SelectItem key={column} value={column}>
                                      {column}
                                      {analysis && (
                                        <span className="text-xs text-gray-500 ml-2">
                                          ({analysis.numericCount}n, {analysis.stringCount}s)
                                        </span>
                                      )}
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Chart Visualization */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-gray-300 dark:border-slate-700 shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-white transition-colors duration-300">
                          Chart Visualization
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-slate-300 transition-colors duration-300">
                          Interactive chart based on your Excel data ({selectedFile.data?.length || 0} rows)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-96 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 transition-colors duration-300">
                          <ChartComponent
                            data={selectedFile.data || []}
                            chartType={chartType}
                            xAxis={xAxis}
                            yAxis={yAxis}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Data Preview */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-gray-300 dark:border-slate-700 shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-white transition-colors duration-300">
                          Data Preview
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-slate-300 transition-colors duration-300">
                          First 10 rows of your Excel data ({selectedFile.data?.length || 0} total rows,{" "}
                          {selectedFile.columns?.length || 0} columns)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-gray-200 dark:border-slate-700">
                                {selectedFile.columns?.map((column) => {
                                  const analysis = selectedFile.debugInfo?.columnAnalysis?.find(
                                    (a) => a.column === column,
                                  )
                                  return (
                                    <TableHead
                                      key={column}
                                      className="text-gray-700 dark:text-slate-300 font-medium transition-colors duration-300"
                                    >
                                      <div>
                                        <div>{column}</div>
                                        {analysis && (
                                          <div className="text-xs text-gray-500">
                                            {analysis.numericCount > 0 && (
                                              <span className="text-green-600">{analysis.numericCount}n </span>
                                            )}
                                            {analysis.stringCount > 0 && (
                                              <span className="text-blue-600">{analysis.stringCount}s</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </TableHead>
                                  )
                                })}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedFile.data?.slice(0, 10).map((row, index) => (
                                <TableRow
                                  key={index}
                                  className="border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-300"
                                >
                                  {selectedFile.columns?.map((column) => (
                                    <TableCell
                                      key={column}
                                      className="text-gray-600 dark:text-slate-300 transition-colors duration-300"
                                    >
                                      <div>
                                        <span
                                          className={
                                            typeof row[column] === "number"
                                              ? "text-green-600 font-medium"
                                              : "text-gray-600"
                                          }
                                        >
                                          {row[column] !== null && row[column] !== undefined
                                            ? String(row[column])
                                            : "-"}
                                        </span>
                                        {debugMode && (
                                          <span className="text-xs text-gray-400 ml-1">({typeof row[column]})</span>
                                        )}
                                      </div>
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center h-96"
                >
                  <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-gray-300 dark:border-slate-700 shadow-xl w-full transition-all duration-300">
                    <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                      <BarChart3 className="h-16 w-16 text-gray-400 dark:text-slate-500 mb-4 transition-colors duration-300" />
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">
                        No File Selected
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400 mb-4 transition-colors duration-300">
                        Upload and select an Excel file to start creating charts from your real data
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Excel File
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

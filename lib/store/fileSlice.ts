import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UploadedFile {
  id: string
  name: string
  size: number
  uploadDate: string
  status: "processing" | "completed" | "error"
  data?: any[]
  columns?: string[]
}

interface FileState {
  files: UploadedFile[]
  selectedFile: UploadedFile | null
  isLoading: boolean
}

const initialState: FileState = {
  files: [],
  selectedFile: null,
  isLoading: false,
}

const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<UploadedFile[]>) => {
      state.files = action.payload
    },
    addFile: (state, action: PayloadAction<UploadedFile>) => {
      state.files.push(action.payload)
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((file) => file.id !== action.payload)
    },
    setSelectedFile: (state, action: PayloadAction<UploadedFile | null>) => {
      state.selectedFile = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setFiles, addFile, removeFile, setSelectedFile, setLoading } = fileSlice.actions
export default fileSlice.reducer

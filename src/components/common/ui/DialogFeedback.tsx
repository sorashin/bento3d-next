import React, { FC, useEffect, useState, useRef } from "react"
import axios from "axios"
import { Dialog } from "@/components/common/ui/Dialog"
import Icon from "@/components/common/ui/Icon"
import { useSettingsStore, Toast } from "@/stores/settings"

export const DialogFeedback: FC = () => {
  const { dialog, closeDialog, toast, setToast } = useSettingsStore(
    (state) => state
  )
  const isOpen = dialog.isOpen && dialog.type === "feedback"
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState<number | undefined>(undefined)
  const [message, setMessage] = useState("")
  const [disabled, setDisabled] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleReset = () => {
    setFeedback("")
    setRating(undefined)
    setMessage("")
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleValidation = () => {
    if (rating === undefined && feedback === "") {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }

  const handleToast = () => {
    const i: Toast = {
      content: "Thank you for your feedback !",
      type: "default",
      isOpen: true,
    }
    setToast([...toast, i])
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（30MB制限）
      if (file.size > 30 * 1024 * 1024) {
        setMessage("File size must be 30MB or less.")
        return
      }

      // ファイル形式チェック
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
      if (!allowedTypes.includes(file.type)) {
        setMessage("Unsupported file format. Please select an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV).")
        return
      }

      setSelectedFile(file)
      setMessage("")

      // プレビュー用URL作成
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('feedback', feedback)
      if (rating !== undefined) {
        formData.append('rating', rating.toString())
      }
      if (selectedFile) {
        formData.append('photo', selectedFile)
      }

      const response = await axios.post(
        "https://bento3d-feedback-api-7534790305.asia-northeast1.run.app/addNotionItem",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (response.status === 200) {
        handleReset()
        closeDialog()
        handleToast()
      } else {
        setMessage("Failed to send feedback. Please try again.")
      }
    } catch (error) {
      console.error("Error sending feedback:", error)
      setMessage("Error sending feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleValidation()
  }, [rating, feedback])

  useEffect(() => {
    handleReset()
  }, [isOpen])

  // コンポーネントのアンマウント時にプレビューURLをクリーンアップ
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <Dialog isOpen={isOpen} onClose={() => closeDialog()} className="max-w-sm">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col font-sans p-4 w-full gap-6 text-content-h">
        <h3 className="text-content-h text-xl font-medium px-2">
          Send feedback,
          <br />
          <span className="text-content-l">We read them all!</span>
        </h3>

        <div className="grid grid-cols-5 gap-2 w-full max-w-[320px] mx-auto">
          {[...Array(5)].map((_, i) => (
            <button
              value={i + 1}
              onClick={(e) => {
                e.preventDefault()
                setRating(i)
              }}
              key={i}
              className={`size-full rounded-full flex items-center justify-center ${
                rating === i ? "bg-content-h-a" : "bg-content-xl-a"
              }`}
              style={{ width: "100%", height: "100%", aspectRatio: "1 / 1" }}>
              <img
                src={`/images/ratings/0${i + 1}.png`}
                alt=""
                className="size-1/2"
              />
            </button>
          ))}
        </div>
        <div>
          <label className="text-lg flex flex-col gap-3 font-medium px-2 mb-3">
            How can we improve your experience ?
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            placeholder="Write your feedback here..."
            className="rounded-md w-full min-h-32 bg-content-xl-a p-3 text-base focus:outline-none focus:ring-1 focus:ring-content-l-a"
          />
        </div>

        {/* ファイル添付セクション */}
        <div>
          <label className="text-lg flex flex-col gap-3 font-medium px-2 mb-3">
            Attach image or video (optional)
          </label>
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 border-2 border-dashed border-content-l-a rounded-md text-content-l hover:border-content-h-a transition-colors">
              <div className="flex items-center justify-center gap-2">
                <Icon name="plus" className="size-5" />
                <span>Choose file</span>
              </div>
              <p className="text-sm text-content-m mt-1">
                Images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, MOV) • Max
                30MB
              </p>
            </button>

            {/* プレビュー */}
            {previewUrl && selectedFile && (
              <div className="relative">
                <div className="bg-content-xl-a rounded-md p-3">
                  {selectedFile.type.startsWith("image/") ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-content-m truncate">
                      {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-system-error hover:text-red-600">
                      <Icon name="trash" className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {message && <p className="text-sm text-system-error">{message}</p>}
        <button
          type="submit"
          className={`w-full py-2 rounded-full text-white font-semibold cursor-pointer ${
            disabled || loading
              ? "bg-content-l-a text-content-m-a cursor-not-allowed"
              : "bg-content-h-a"
          }`}
          disabled={disabled || loading}>
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 mx-auto"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="white"
                stroke-opacity="0.25"
                stroke-width="3"
              />
              <path
                d="M21 12C21 10.8181 20.7672 9.64778 20.3149 8.55585C19.8626 7.46392 19.1997 6.47177 18.364 5.63604C17.5282 4.80031 16.5361 4.13738 15.4442 3.68508C14.3522 3.23279 13.1819 3 12 3"
                stroke="white"
                stroke-opacity="0.75"
                stroke-width="3"
              />
            </svg>
          ) : (
            "Submit"
          )}
        </button>
        <div
          className="size-8 flex items-center justify-center absolute top-4 right-4 cursor-pointer bg-content-xl-a rounded-full hover:scale-110"
          onClick={() => closeDialog()}>
          <Icon name="close" />
        </div>
      </form>
    </Dialog>
  )
}

export default DialogFeedback

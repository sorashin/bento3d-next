import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Icon from "@/components/common/ui/Icon"

export const Page = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    // Optional: Send analytics event
    console.log("Payment successful, session ID:", sessionId)
  }, [sessionId])

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-surface-base">
      <div className="flex flex-col items-center gap-6 p-8 bg-surface-sheet-l rounded-lg max-w-md">
        <div className="size-20 rounded-full bg-system-success-l flex items-center justify-center">
          <Icon name="check" className="size-12 stroke-system-success-h stroke-[3px]" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-content-h">Order Successful!</h1>
          <p className="text-center text-content-m">
            Thank you for your order. We will start 3D printing your tray soon.
          </p>
          {sessionId && (
            <p className="text-xs text-content-l mt-2">
              Order ID: {sessionId}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => navigate("/bento3d")}
            className="b-button bg-content-h text-surface-base hover:bg-content-m w-full justify-center">
            Back to Editor
          </button>
        </div>

        <div className="text-xs text-content-m text-center">
          <p>You will receive an email confirmation shortly.</p>
          <p>If you have any questions, please contact support.</p>
        </div>
      </div>
    </div>
  )
}

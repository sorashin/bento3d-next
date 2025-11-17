import { useNavigate } from "react-router-dom"
import Icon from "@/components/common/ui/Icon"

export const Page = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-surface-base">
      <div className="flex flex-col items-center gap-6 p-8 bg-surface-sheet-l rounded-lg max-w-md">
        <div className="size-20 rounded-full bg-system-error-l flex items-center justify-center">
          <Icon name="x" className="size-12 stroke-system-error-h stroke-[3px]" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-content-h">Order Cancelled</h1>
          <p className="text-center text-content-m">
            Your order has been cancelled. No charges have been made.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => navigate("/bento3d")}
            className="b-button bg-content-h text-surface-base hover:bg-content-m w-full justify-center">
            Back to Editor
          </button>
        </div>

        <div className="text-xs text-content-m text-center">
          <p>Feel free to try again when you're ready.</p>
          <p>If you need help, please contact support.</p>
        </div>
      </div>
    </div>
  )
}

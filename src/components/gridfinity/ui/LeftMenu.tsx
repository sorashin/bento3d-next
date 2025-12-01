import { LeftMenu as CommonLeftMenu } from "@/components/common/ui/LeftMenu"
import { useGridfinityStore } from "@/stores/gridfinity"

export const LeftMenu = () => {
  const { totalRows, totalCols, setTotalRows, setTotalCols } = useGridfinityStore()

  const renderSettings = () => {
    return (
      <>
        <label htmlFor="rows" className="text-content-m-a text-xs">
          Rows
        </label>
        <div className="flex items-center w-full relative">
          <input
            value={totalRows}
            type="range"
            min={1}
            max={20}
            step={1}
            onChange={(e) => setTotalRows(parseInt(e.target.value))}
            className="b-input-range h-8 w-full cursor-pointer appearance-none overflow-hidden rounded-lg bg-content-xxl-a transition-all hover:bg-[rgba(28,28,28,.08)]"
          />
          <span className="absolute right-2 text-sm text-content-m-a">
            {totalRows}
          </span>
        </div>
        <label htmlFor="cols" className="text-content-m-a text-xs">
          Cols
        </label>
        <div className="flex items-center w-full relative">
          <input
            value={totalCols}
            type="range"
            min={1}
            max={20}
            step={1}
            onChange={(e) => setTotalCols(parseInt(e.target.value))}
            className="b-input-range h-8 w-full cursor-pointer appearance-none overflow-hidden rounded-lg bg-content-xxl-a transition-all hover:bg-[rgba(28,28,28,.08)]"
          />
          <span className="absolute right-2 text-sm text-content-m-a">
            {totalCols}
          </span>
        </div>
      </>
    )
  }

  return <CommonLeftMenu renderSettings={renderSettings} />
}

import Canvas from "./Canvas"

export function Page() {
  return (
    <>
      <Canvas />
      <div className="flex flex-1 overflow-hidden absolute">
        {/* <Headers/> */}
      </div>
    </>
  )
}

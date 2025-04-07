import { useEffect, useMemo } from "react"
import { useModularStore } from "@/stores/modular"
import { useControls } from "leva"
import { Schema } from "leva/dist/declarations/src/types"

const Controls = () => {
  // zustandから状態とアクションを取得
  const { nodes, updateNodeProperty } = useModularStore()

  // Levaコントロール用のパラメータを生成
  const params = useMemo(() => {
    console.log("nodes", nodes)
    return nodes
      .map((node) => {
        const { properties, label } = node

        const property = properties.find(
          (prop) => prop.name === "value" || prop.name === "content"
        )
        if (property === undefined) {
          return null
        }

        const { value } = property

        if (node.label !== undefined && value.type === "Number") {
          //Number兼NumberSlider
          const range = properties.find(
            (prop: { name: string }) => prop.name === "range"
          )
          const step = properties.find(
            (prop: { name: string }) => prop.name === "step"
          )

          const parameter = {
            id: node.id,
            name: node.label,
            value: value.content,
          }

          if (
            range?.value.type === "Vector2d" &&
            step?.value.type === "Number"
          ) {
            return {
              min: range.value.content[0],
              max: range.value.content[1],
              step: step.value.content,
              ...parameter,
            }
          }

          return parameter
        } else if (node.label !== undefined && value.type === "String") {
          const parameter = {
            id: node.id,
            name: node.label,
            value: value.content,
          }

          return parameter
        }
        return null
      })
      .reduce((acc, curr) => {
        if (curr !== null) {
          if ("min" in curr) {
            acc[curr.name] = {
              value: curr.value,
              min: curr.min,
              max: curr.max,
              step: curr.step,
              onEditEnd: (value: number) => {
                updateNodeProperty(curr.id, value)
              },
            }
          } else if (typeof curr.value == "string") {
            console.log("curr", curr)
            acc[curr.name] = {
              value: curr.value,
              onEditEnd: (value: string) => {
                updateNodeProperty(curr.id, value)
              },
            }
          } else {
            acc[curr.name] = {
              value: curr.value,
              onEditEnd: (value: number) => {
                updateNodeProperty(curr.id, value)
              },
            }
          }
        }

        return acc
      }, {} as Schema)
  }, [nodes, updateNodeProperty])

  useEffect(() => {
    console.log("params", params)
  }, [params])

  useControls(params, [params])

  return <></>
}

export default Controls

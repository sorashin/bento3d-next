import { setup } from "xstate";

export const machine = setup({
  types: {
    context: {} as {},
    events: {} as
      | { type: "draw_start" }
      | { type: "draw_end" }
      | { type: "to_3D" }
      | { type: "to_2D" },
  },
}).createMachine({
  context: {},
  id: "wall",
  initial: "2DView",
  states: {
    "2DView": {
      initial: "IDLE",
      on: {
        to_3D: {
          target: "3DView",
        },
      },
      states: {
        IDLE: {
          on: {
            draw_start: {
              target: "DRAW",
            },
          },
        },
        DRAW: {
          on: {
            draw_end: {
              target: "IDLE",
            },
          },
        },
      },
    },
    "3DView": {
      on: {
        to_2D: {
          target: "2DView",
        },
      },
    },
  },
});
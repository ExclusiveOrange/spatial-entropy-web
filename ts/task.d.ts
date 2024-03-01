// 2024.02.29 Atlee Brink
// Defines a worker Task

import { spatial_entropy_u8 } from "../c/spatial_entropy_u8.js"

type A = number;
type B = string;
type C = boolean;

type myTypes = A | B | C;

export const TaskKind: Record<myTypes, number> = {
  A: 0,
  B: 1,
  C: 2,
}

type Task_spatial_entropy_u8 = {
  kind: TaskKind.spatial_entropy_u8
  args: Parameters<spatial_entropy_u8>
}

// TODO: make into a union if another kind of task is added later
export type Task = Task_spatial_entropy_u8

function getTaskKind<T extends myTypes>(): TaskKind[T] {
  return TaskKind[T]
}

const x = getTaskKind<A>();
// 2024.02.29 Atlee Brink

import { MAX_KERNEL_RADIUS } from "./limits.js";
import { makeLog2Table } from "./makeLog2Table.js";


const log2Table: Float32Array = makeLog2Table((1 + 2 * MAX_KERNEL_RADIUS)**2)

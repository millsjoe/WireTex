import type { Node } from "./renderer";

// Generated at build time from lib/grammar.pegjs
import { parse as pegParse } from "./parser.generated.js";

export function parseWireTex(source: string): Node[] {
  return pegParse(source) as Node[];
}

export type { Node };

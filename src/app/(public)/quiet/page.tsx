import { getConfig } from "@/lib/config";
import { QuietMap } from "./quiet-map";

const { osKey } = getConfig();

export default function QuietLanesPage() {
  return <QuietMap osKey={osKey} />;
}

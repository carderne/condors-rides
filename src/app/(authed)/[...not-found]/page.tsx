// Workaround for this issue:
// https://github.com/vercel/next.js/discussions/50034

import { notFound } from "next/navigation";

export default function NotFoundDummy() {
  return notFound();
}

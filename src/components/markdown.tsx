import Link from "next/link";
import type { ComponentProps, ReactElement } from "react";
import { Children, cloneElement, isValidElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Md({ children }: { children: string }) {
  const transformed = shortenUrls(children);
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: LinkRenderer,
        p: MentionRenderer,
      }}
    >
      {transformed}
    </Markdown>
  );
}

function LinkRenderer(props: ComponentProps<"a">) {
  return (
    <Link href={props.href ?? ""} target="_blank" rel="noreferrer">
      {props.children}
    </Link>
  );
}

function shortenUrls(markdown: string): string {
  return markdown.replace(
    // negative lookbehind: ensure not immediately after `](` (i.e., not already a markdown link)
    /(?<!\]\()(https:\/\/[^\s)]+)/g,
    (fullUrl) => {
      try {
        const url = new URL(fullUrl);
        const host = url.hostname.replace(/^www\./, "");
        const path = url.pathname + url.search;
        const shortPath = path !== "/" && path.length > 10 ? path.slice(0, 10) + "…" : path;
        const display = `${host}${shortPath}`;
        return `[${display}](${fullUrl})`;
      } catch {
        return fullUrl;
      }
    },
  );
}

function MentionRenderer({ children }: ComponentProps<"p">) {
  return <p>{Children.map(children, processChild)}</p>;
}

function processChild(child: React.ReactNode): React.ReactNode {
  if (typeof child === "string") {
    const parts = child.split(/(@\w+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="text-primary font-medium">
          {part}
        </span>
      ) : (
        part
      ),
    );
  }

  if (isValidElement(child)) {
    const element = child as ReactElement<{ children?: React.ReactNode }>;
    if (element.props.children) {
      return cloneElement(element, {
        children: Children.map(element.props.children, processChild),
      });
    }
  }

  return child;
}

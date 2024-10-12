// components/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import "highlight.js/styles/github.css";

declare module "rehype-highlight";
declare module "rehype-sanitize";

interface MarkdownRendererProps {
  markdownText: string;
}

const components: Components = {
  ul: ({ node, ordered, ...props }: any) => <ul className="list-disc list-inside" {...props} />,
  ol: ({ node, ordered, ...props }: any) => <ol className="list-decimal list-inside" {...props} />,
  strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
  p: ({ children }: any) => <p className="inline-block">{children}</p>,
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownText }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeSanitize]}
      components={components}
    >
      {markdownText}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;

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
  ul: (props: React.ComponentProps<'ul'>) => <ul className="list-disc list-inside" {...props} />,
  ol: (props: React.ComponentProps<'ol'>) => <ol className="list-decimal list-inside" {...props} />,
  strong: (props: React.ComponentProps<'strong'>) => <strong className="font-bold">{props.children}</strong>,
  p: (props: React.ComponentProps<'p'>) => <p className="inline-block">{props.children}</p>,
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

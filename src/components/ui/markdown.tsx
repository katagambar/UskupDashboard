'use client'

/**
 * Markdown Renderer Component
 * 
 * Renders markdown content with syntax highlighting and custom styling.
 */

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ComponentPropsWithoutRef } from 'react'

interface MarkdownProps {
  content: string
  className?: string
}

/**
 * Styled Markdown Renderer
 * 
 * Features:
 * - GitHub Flavored Markdown (tables, strikethrough, etc)
 * - Custom styled components
 * - Dark mode support
 * - Code block styling
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownProps) {
  return (
    <div className={`markdown-content prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2" {...props}>
              {children}
            </h3>
          ),
          
          // Paragraphs
          p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props}>
              {children}
            </p>
          ),
          
          // Lists
          ul: ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
            <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700 dark:text-gray-300" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
            <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700 dark:text-gray-300" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }: ComponentPropsWithoutRef<'li'>) => (
            <li className="pl-2" {...props}>{children}</li>
          ),
          
          // Links
          a: ({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              {...props}
            >
              {children}
            </a>
          ),
          
          // Code
          code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
            const isInline = !className
            if (isInline) {
              return (
                <code 
                  className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm text-pink-600 dark:text-pink-400 font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={`${className} font-mono`} {...props}>
                {children}
              </code>
            )
          },
          pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
            <pre 
              className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm"
              {...props}
            >
              {children}
            </pre>
          ),
          
          // Blockquote
          blockquote: ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
            <blockquote 
              className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4"
              {...props}
            >
              {children}
            </blockquote>
          ),
          
          // Tables
          table: ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }: ComponentPropsWithoutRef<'thead'>) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
            <th 
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
            <td 
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700"
              {...props}
            >
              {children}
            </td>
          ),
          
          // Horizontal rule
          hr: (props: ComponentPropsWithoutRef<'hr'>) => (
            <hr className="border-gray-200 dark:border-gray-700 my-6" {...props} />
          ),
          
          // Strong/Bold
          strong: ({ children, ...props }: ComponentPropsWithoutRef<'strong'>) => (
            <strong className="font-semibold text-gray-900 dark:text-white" {...props}>
              {children}
            </strong>
          ),
          
          // Emphasis/Italic
          em: ({ children, ...props }: ComponentPropsWithoutRef<'em'>) => (
            <em className="italic" {...props}>{children}</em>
          ),
          
          // Images
          img: ({ src, alt, ...props }: ComponentPropsWithoutRef<'img'>) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={src} 
              alt={alt || ''}
              className="max-w-full h-auto rounded-lg shadow-md my-4"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

/**
 * Compact Markdown for preview/cards
 */
export function MarkdownPreview({ content, className = '' }: MarkdownProps) {
  // Truncate content for preview
  const previewContent = content.length > 200 
    ? content.substring(0, 200) + '...'
    : content

  return (
    <div className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <span>{children}</span>,
          a: ({ children }) => <span className="text-blue-500">{children}</span>,
          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          code: ({ children }) => (
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
              {children}
            </code>
          ),
          // Strip block elements for preview
          h1: ({ children }) => <span className="font-bold">{children}</span>,
          h2: ({ children }) => <span className="font-semibold">{children}</span>,
          h3: ({ children }) => <span className="font-medium">{children}</span>,
          ul: ({ children }) => <span>{children}</span>,
          ol: ({ children }) => <span>{children}</span>,
          li: ({ children }) => <span>{children} </span>,
          blockquote: ({ children }) => <span className="italic">{children}</span>,
        }}
      >
        {previewContent}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer

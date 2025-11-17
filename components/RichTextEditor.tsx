'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, $getSelection, $isRangeSelection } from 'lexical';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode, $createLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { useEffect, useState } from 'react';

// Toolbar Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const formatBold = () => {
    editor.dispatchCommand({ type: 'FORMAT_TEXT_COMMAND', payload: 'bold' } as any, undefined);
  };

  const formatItalic = () => {
    editor.dispatchCommand({ type: 'FORMAT_TEXT_COMMAND', payload: 'italic' } as any, undefined);
  };

  const formatBulletList = () => {
    editor.dispatchCommand({ type: 'INSERT_UNORDERED_LIST_COMMAND' } as any, undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand({ type: 'INSERT_ORDERED_LIST_COMMAND' } as any, undefined);
  };

  const openLinkModal = () => {
    // Get selected text if any
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const text = selection.getTextContent();
        setLinkText(text);
      }
    });
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (!linkUrl) return;

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // If there's selected text, convert it to a link
        if (selection.getTextContent()) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
        } else if (linkText) {
          // If no selection but we have link text, insert new link
          const linkNode = $createLinkNode(linkUrl);
          linkNode.append($getRoot().getFirstChild() as any);
          selection.insertNodes([linkNode]);
        }
      }
    });

    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  return (
    <>
      <div className="flex items-center gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <button
          type="button"
          onClick={formatBold}
          className="px-3 py-1.5 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={formatItalic}
          className="px-3 py-1.5 text-sm italic hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title="Italic"
        >
          I
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button
          type="button"
          onClick={formatBulletList}
          className="px-3 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={formatNumberedList}
          className="px-3 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title="Numbered List"
        >
          1. List
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button
          type="button"
          onClick={openLinkModal}
          className="px-3 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title="Insert Link"
        >
          🔗 Link
        </button>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLinkModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link Text {!linkText && '(optional)'}
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                disabled={!linkUrl}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Plugin to load initial HTML content
function InitialContentPlugin({ html }: { html?: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (html) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().clear();
        $getRoot().select();
        $insertNodes(nodes);
      });
    }
  }, []); // Only run once on mount

  return null;
}

interface RichTextEditorProps {
  value?: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Enter text...' }: RichTextEditorProps) {
  const initialConfig = {
    namespace: 'WishlistPreferences',
    theme: {
      paragraph: 'mb-2',
      list: {
        ul: 'list-disc list-inside mb-2',
        ol: 'list-decimal list-inside mb-2',
      },
      link: 'text-indigo-600 dark:text-indigo-400 hover:underline',
    },
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      AutoLinkNode,
    ],
  };

  const handleChange = (editorState: any, editor: any) => {
    editor.read(() => {
      const html = $generateHtmlFromNodes(editor);
      onChange(html);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[150px] p-4 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          }
          placeholder={
            <div className="absolute top-14 left-4 text-gray-400 pointer-events-none">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin onChange={handleChange} />
        {value && <InitialContentPlugin html={value} />}
      </div>
    </LexicalComposer>
  );
}

import React, { useCallback, useMemo, useState } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import type { RenderLeafProps, RenderElementProps } from 'slate-react';
import { createEditor, Text } from 'slate';
import type { Range, NodeEntry } from 'slate';
import type { Node } from 'slate';
import { withHistory } from 'slate-history';
import { Box } from '@chakra-ui/react';
import { Element, Leaf, Toolbar } from './editorcomponent';

type HighlightProps = {
  router?: string;
  showIndicator?: boolean;
  text: string;
}[];
export interface RichTextBlockProps {
  json?: string;
  readonly?: boolean;
  highlights?: HighlightProps;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
}

export const RTEditor: React.FC<RichTextBlockProps> = ({
  json = '[]',
  readonly = false,
  highlights = [],
  onMouseUp,
}) => {
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, _] = useState<Node[]>(JSON.parse(json));

  const divRef = React.useRef<HTMLDivElement>(null);

  const decorate = useCallback(
    ([node, path]: NodeEntry<Node>) => {
      const ranges: Range[] = [];
      if (highlights?.length && Text.isText(node)) {
        const { text } = node;
        let offset = 0;
        highlights.forEach((highlight) => {
          const i = text.indexOf(highlight.text);
          if (i >= 0) {
            ranges.push({
              anchor: { path, offset: i },
              focus: { path, offset: i + highlight.text.length },
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              highlight: true,
              router: highlight.router,
              showIndicator: highlight.showIndicator || false,
            });
            offset = offset + i + highlight.text.length;
          }
        });
      }

      return ranges;
    },
    [highlights]
  );
  const [jsonValue, setJsonValue] = useState('[]');

  return (
    <Box ref={divRef} borderWidth={readonly ? undefined : '1px'} height='100%'>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          const isAstChange = editor.operations.some((op) => 'set_selection' !== op.type);
          if (isAstChange) {
            // Save the value to Local Storage.
            const content = JSON.stringify(value);
            localStorage.setItem('content', content);
            setJsonValue(content);
          }
        }}
      >
        {readonly ? null : <Toolbar />}
        <Box padding={readonly ? '' : '15px 5px'}>
          <Editable
            decorate={decorate}
            readOnly={readonly}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder='Start editing...'
            spellCheck
            style={
              readonly
                ? {}
                : {
                    minHeight: '150px',
                    resize: 'vertical',
                    overflow: 'auto',
                    fontSize: '1.25rem',
                  }
            }
            onMouseUp={onMouseUp}
          />
        </Box>
        <input readOnly hidden name='json' value={jsonValue} />
      </Slate>
    </Box>
  );
};

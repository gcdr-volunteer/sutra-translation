import React, { useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { createPlateUI, Plate } from '@udecode/plate';
import { createMyPlugins } from './typescript/plateTypes';
import type { MyParagraphElement, MyValue } from './typescript/plateTypes';
import { Toolbar } from './toolbar/Toolbar';
import { ToolbarButtons } from './toolbar/ToolbarButtons';
import { MyCommentsProvider } from './comments/MyCommentsProvider';
import { CommentBalloonToolbar } from './comments/CommentBalloonToolbar';
import { editableProps } from './common/editableProps';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
  createAlignPlugin,
  createBoldPlugin,
  createCodePlugin,
  createComboboxPlugin,
  createCommentsPlugin,
  createDeserializeCsvPlugin,
  createDeserializeDocxPlugin,
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
  createHeadingPlugin,
  createHighlightPlugin,
  createIndentPlugin,
  createItalicPlugin,
  createKbdPlugin,
  createNodeIdPlugin,
  createParagraphPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  PlateFloatingComments,
  PlateProvider,
} from '@udecode/plate';
import { withStyledDraggables } from './dnd/withStyledDraggables';
import { withStyledPlaceHolders } from './placeholder/withStyledPlaceHolders';

import { indentPlugin } from './indent/indentPlugin';
import { alignPlugin } from './align/alignPlugin';
import { Box, Text } from '@chakra-ui/react';
let components = createPlateUI({
  // customize your components by plugin key
});
components = withStyledPlaceHolders(components);

const styles: Record<string, CSSProperties> = {
  container: { position: 'relative', background: 'white', height: '100vh' },
};

export const PEditor = () => {
  const plugins = useMemo(
    () =>
      createMyPlugins(
        [
          createParagraphPlugin({
            component: Text,
          }),
          createHeadingPlugin(),
          createAlignPlugin(alignPlugin),
          createBoldPlugin(),
          createCodePlugin(),
          createItalicPlugin(),
          createHighlightPlugin(),
          createUnderlinePlugin(),
          createStrikethroughPlugin(),
          createFontColorPlugin(),
          createFontBackgroundColorPlugin(),
          createFontSizePlugin(),
          createKbdPlugin(),
          createNodeIdPlugin(),
          createIndentPlugin(indentPlugin),
          createComboboxPlugin(),
          createCommentsPlugin(),
          createDeserializeCsvPlugin(),
          createDeserializeDocxPlugin(),
        ],
        {
          components: withStyledDraggables(components),
        }
      ),
    []
  );
  const initialValue = [
    {
      type: 'p',
      children: [
        {
          text: 'This is editable plain text with react and history plugins, just like a <textarea>!',
        },
      ],
    } as MyParagraphElement,
  ];
  const containerRef = useRef(null);
  return (
    <Box bg='white' px={8} paddingBottom={8} pos='relative'>
      <DndProvider backend={HTML5Backend}>
        <PlateProvider<MyValue> initialValue={initialValue} plugins={plugins}>
          <Toolbar
            style={{
              position: 'sticky',
              top: 0,
              left: 5,
              background: 'lightgrey',
              zIndex: 9999,
              width: '100%',
              minHeight: '80px',
              padding: 0,
            }}
          >
            <ToolbarButtons />
          </Toolbar>

          <MyCommentsProvider>
            <div ref={containerRef} style={styles.container}>
              <Plate editableProps={editableProps}>
                <CommentBalloonToolbar />
              </Plate>
            </div>

            <PlateFloatingComments />
          </MyCommentsProvider>
        </PlateProvider>
      </DndProvider>
    </Box>
  );
};

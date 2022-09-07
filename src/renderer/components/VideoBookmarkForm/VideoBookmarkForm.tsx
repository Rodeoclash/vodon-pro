import * as React from 'react';
import { usePopper } from 'react-popper';
import { useHotkeys } from 'react-hotkeys-hook';

import { Box, Flex, FormControl, FormLabel, Textarea } from '@chakra-ui/react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

import type {
  VideoBookmark,
  VideoBookmarkIcon,
} from '../../services/models/VideoBookmark';

type Props = {
  bookmark: VideoBookmark;
  onChangeContent: (content: string) => void;
  onChangeIcon: (details: VideoBookmarkIcon) => void;
};

export default function VideoBookmarkEditor({
  bookmark,
  onChangeContent,
  onChangeIcon,
}: Props) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState<boolean>(false);
  const [referenceElement, setReferenceElement] =
    React.useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] =
    React.useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'left',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [20, 20],
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top', 'left', 'bottom', 'right'],
        },
      },
    ],
  });

  const handleEmojiPicked = React.useCallback(
    (details) => {
      setShowEmojiPicker(false);
      onChangeIcon(details);
    },
    [onChangeIcon]
  );

  /**
   * Escape closes the emoji picker
   */
  useHotkeys(
    'esc',
    () => {
      setShowEmojiPicker(false);
    },
    {},
    [setShowEmojiPicker]
  );

  return (
    <form>
      <FormControl mb={4}>
        <FormLabel>Icon</FormLabel>

        <Flex
          align="center"
          bgColor="gray.800"
          height="10"
          justify="center"
          rounded="xl"
          width="10"
          fontSize="lg"
          cursor="pointer"
          ref={setReferenceElement}
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
          }}
        >
          {bookmark.icon.native}
        </Flex>
        {showEmojiPicker && (
          <Box
            ref={setPopperElement}
            zIndex="1"
            style={styles.popper}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...attributes.popper}
          >
            <Picker
              data={data}
              onEmojiSelect={(details: VideoBookmarkIcon) =>
                handleEmojiPicked(details)
              }
            />
          </Box>
        )}
      </FormControl>
      <FormControl>
        <FormLabel>Description</FormLabel>
        <Textarea
          value={bookmark.content}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChangeContent(event.target.value)
          }
          autoFocus
        />
      </FormControl>
    </form>
  );
}

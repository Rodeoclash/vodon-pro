import { css } from '@emotion/react';

import { FormControl, FormLabel, Textarea } from '@chakra-ui/react';
import Draggable from 'react-draggable'; // The default

import type { VideoBookmark } from '../../services/models/VideoBookmark';

type Props = {
  bookmark: VideoBookmark;
  onChange: (content: string) => void;
};

export default function VideoBookmarkEditor({ bookmark, onChange }: Props) {
  return (
    <form>
      <FormControl>
        <FormLabel>Description</FormLabel>
        <Textarea
          value={bookmark.content}
          onChange={(event) => onChange(event.target.value)}
          autoFocus
        />
      </FormControl>
    </form>
  );
}

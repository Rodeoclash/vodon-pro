import { SyntheticEvent, useState } from "react";

import useStore from "../../services/store";

import {
  Box,
  Button,
  ButtonGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";

import { Bookmark as BookmarkIcon } from "tabler-icons-react";

import type { Video } from "../../services/models/Video";
import type { VideoBookmark } from "../../services/models/VideoBookmark";

type Props = {
  bookmark: VideoBookmark;
  video: Video;
};

export default function VideoBookmark({ video, bookmark }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteVideoBookmark = useStore((state) => state.deleteVideoBookmark);
  const setCurrentTime = useStore((state) => state.setCurrentTime);

  function handleOpen(event: SyntheticEvent) {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleDelete() {
    deleteVideoBookmark(video, bookmark);
  }

  function handleGoto() {
    setCurrentTime(bookmark.time);
    setIsOpen(false);
  }

  return (
    <Box>
      <Popover isOpen={isOpen} onClose={handleClose} placement="top">
        <PopoverTrigger>
          <Box onClick={handleOpen} cursor="pointer">
            <BookmarkIcon />
          </Box>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>&nbsp;</PopoverHeader>
          <PopoverBody>
            <Text fontSize={"sm"}>{bookmark.content}</Text>
          </PopoverBody>
          <PopoverFooter>
            <ButtonGroup size="sm" display={"flex"} justifyContent={"right"}>
              <Button colorScheme={"red"} onClick={handleDelete}>
                Delete
              </Button>
              <Button colorScheme={"green"} onClick={handleGoto}>
                Goto
              </Button>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </Box>
  );
}

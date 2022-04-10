import { useState } from "react";
import useStore from "../../services/store";

import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Textarea,
  Tooltip,
  Text,
} from "@chakra-ui/react";

import { Bookmark as BookmarkIcon } from "tabler-icons-react";

import type { Video } from "../../services/models/Video";

type Props = {
  video: Video;
};

export default function VideoBookmark({ video }: Props) {
  const createVideoBookmark = useStore((state) => state.createVideoBookmark);
  const currentTime = useStore((state) => state.currentTime);

  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleCreate() {
    createVideoBookmark(video, description, currentTime);
    setDescription("");
    setIsOpen(false);
  }

  return (
    <>
      <Popover isOpen={isOpen} onClose={handleClose} placement="top">
        <Tooltip label="Bookmark this moment">
          {/* tooltip hack */}
          <Box>
            <PopoverTrigger>
              <IconButton
                onClick={handleOpen}
                icon={<BookmarkIcon />}
                aria-label="Bookmark this moment"
              />
            </PopoverTrigger>
          </Box>
        </Tooltip>

        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Create bookmark</PopoverHeader>
          <PopoverBody>
            <FormControl>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                autoFocus
              />
            </FormControl>
          </PopoverBody>
          <PopoverFooter>
            <ButtonGroup size="sm" display={"flex"} justifyContent={"right"}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button colorScheme={"green"} onClick={handleCreate}>
                Create
              </Button>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </>
  );
}

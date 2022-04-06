import {
  useCallback,
  useRef,
  useLayoutEffect,
  useState,
  useEffect,
} from "react";
import { Tldraw } from "@tldraw/tldraw";

import { Box } from "@chakra-ui/react";

type Props = {
  fullscreen: boolean;
};

export default function Drawing({ fullscreen }: Props) {
  const tlDrawRef = useRef(null);
  const outerRef = useRef(null);
  const [originalWidth, setOriginalWidth] = useState(null);
  const [scale, setScale] = useState(null);

  const handleMount = useCallback((app) => {
    tlDrawRef.current = app;
  }, []);

  useEffect(() => {
    if (scale === null) {
      return;
    }

    tlDrawRef.current.setCamera([0, 0], scale, "layout_resized");
  }, [scale]);

  useLayoutEffect(() => {
    setTimeout(() => {
      // WHY??
      setOriginalWidth(outerRef.current.offsetWidth);
    });
  }, []);

  useLayoutEffect(() => {
    const handleResize = () => {
      setScale(outerRef.current.offsetWidth / originalWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [originalWidth]);

  return (
    <Box
      position="absolute"
      top={"0"}
      left={"0"}
      right={"0"}
      bottom={"0"}
      ref={outerRef}
    >
      <Tldraw
        onMount={handleMount}
        showMenu={false}
        showPages={false}
        showStyles={fullscreen === false}
        showZoom={false}
      />
    </Box>
  );
}

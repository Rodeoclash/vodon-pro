import { Heading, Text, Box, Link } from "@chakra-ui/react";

import NoSidebar from "../layouts/NoSidebar";

export default function About() {
  return (
    <NoSidebar>
      <Box p={"8"}>
        <Heading as={"h1"} fontSize={"large"}>
          About Vodon Pro
        </Heading>
        <Text my={"2"}>Vodon Pro is built by Sam Richardson in Melbourne.</Text>

        <Heading as={"h1"} fontSize={"large"} mt={"8"}>
          Contact
        </Heading>
        <Text my={"2"}>
          Want to say hi? Email me at{" "}
          <Link href="mailto:sam@richardson.co.nz" textDecoration={"underline"}>
            sam@vodon.gg
          </Link>
          .
        </Text>
        <Text my={"2"}>
          Join our{" "}
          <Link
            href="https://discord.gg/EaJdhHtZEk"
            isExternal
            textDecoration={"underline"}
          >
            Discord
          </Link>
        </Text>
        <Text my={"2"}>
          You can also follow us on{" "}
          <Link
            href="https://twitter.com/GgVodon"
            isExternal
            textDecoration={"underline"}
          >
            Twitter
          </Link>
        </Text>
      </Box>
    </NoSidebar>
  );
}

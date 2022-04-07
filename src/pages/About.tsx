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
          Prefer Discord? Come join us at{" "}
          <Link
            href="https://discord.gg/EaJdhHtZEk"
            isExternal
            textDecoration={"underline"}
          >
            https://discord.gg/EaJdhHtZEk
          </Link>
        </Text>
      </Box>
    </NoSidebar>
  );
}

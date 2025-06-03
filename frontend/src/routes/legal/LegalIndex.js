import { Box, Heading, List, ListItem, Link, Text } from "@chakra-ui/react";
import { COLOR_4 } from "../../constants/constants.js";

const LegalIndex = () => (
    <Box maxW="container.md" mx="auto" py={10} px={4}>
        <Heading size="lg" color={COLOR_4} mb={6}>
            Legal & Policies
        </Heading>

        <Text color={COLOR_4} mb={4}>
            Here are the documents that govern your use of <strong>lipu pona</strong>.
        </Text>

        <List spacing={3} styleType="disc" pl={4}>
            <ListItem>
                <Link href="/site/legal/tos" color="teal.300">
                    Terms of Service
                </Link>
            </ListItem>
            <ListItem>
                <Link href="/site/legal/privacy-policy" color="teal.300">
                    Privacy Policy
                </Link>
            </ListItem>
            <ListItem>
                <Link href="/site/legal/cookies" color="teal.300">
                    Cookie & Tracking Notice
                </Link>
            </ListItem>
        </List>
    </Box>
);

export default LegalIndex;

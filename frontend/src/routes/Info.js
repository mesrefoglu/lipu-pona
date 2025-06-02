import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { COLOR_4 } from "../constants/constants.js";

const Info = () => (
    <Box maxW="container.md" mx="auto" py={10} px={4}>
        <VStack align="stretch" spacing={6}>
            <Heading size="lg" color={COLOR_4}>
                lipu pona — Info
            </Heading>

            <Text color={COLOR_4} whiteSpace="pre-wrap">
                {`lipu pona li ilo pi ante e toki. ona li pali kepeken toki pona la jan li ken
pana e sitelen tawa jan ante, olin, toki, anu wile ante.

This page is a small social network written as a demo project.
It is also meant to help learners of Toki Pona by immersing them in simple
sentences.  Have fun exploring — more detailed documentation will appear
here soon.`}
            </Text>
        </VStack>
    </Box>
);

export default Info;

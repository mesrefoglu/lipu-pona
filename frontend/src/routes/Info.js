import { Box, Heading, Text, VStack } from "@chakra-ui/react";

import { useLang } from "../contexts/useLang.js";
import { COLOR_4 } from "../constants/constants.js";

const Info = () => {
    const { t } = useLang();

    return (
        <Box maxW="container.md" mx="auto" py={10} px={4}>
            <VStack align="stretch" spacing={6}>
                <Heading size="lg" color={COLOR_4}>
                    lipu pona — {t("info")}
                </Heading>

                <Text color={COLOR_4} whiteSpace="pre-wrap">
                    {t("info_body")}
                </Text>

                <Text color={COLOR_4} whiteSpace="pre-wrap">
                    {t("info_open_source")}
                    <Text as="span" color="teal.300">
                        <a href="https://github.com/mesrefoglu/lipu-pona">GitHub</a>
                    </Text>
                </Text>

                <Text color={COLOR_4} whiteSpace="pre-wrap">
                    {t("info_toki_pona")}
                    <Text as="span" color="teal.300">
                        <a href="https://tokipona.org">tokipona.org</a>
                    </Text>
                </Text>

                <Text color={COLOR_4} whiteSpace="pre-wrap">
                    {t("info_contact")}
                </Text>

                <Text color={COLOR_4} whiteSpace="pre-wrap">
                    Legal notices and policies are available in the
                    <Text as="span" color="teal.300">
                        {" "}
                        <a href="/site/legal">Legal & Policies</a>
                    </Text>{" "}
                    section.
                </Text>
            </VStack>
        </Box>
    );
};

export default Info;

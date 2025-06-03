import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { COLOR_4 } from "../constants/constants.js";
import { useLang } from "../contexts/useLang.js";

const EmailSent = () => {
    const { t } = useLang();
    return (
        <Box minH="80vh" display="flex" alignItems="center" justifyContent="center" px={4}>
            <VStack spacing={6} maxW="md" bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <Heading size="lg" textAlign="center" color="#222831">
                    {t("email_sent_heading")}
                </Heading>
                <Text color="#222831" textAlign="center">
                    {t("email_sent_description")}
                </Text>
            </VStack>
        </Box>
    );
};

export default EmailSent;

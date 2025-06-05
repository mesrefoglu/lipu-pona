import {
    Box,
    Flex,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    Alert,
    AlertIcon,
    useToast,
    Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { useLang } from "../contexts/useLang.js";
import { requestPasswordResetApi } from "../api/endpoints.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
    const toast = useToast();
    const { t } = useLang();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const hasErrors = !email || !emailRegex.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!emailRegex.test(email)) {
            setError(t("email_invalid"));
            return;
        }
        setLoading(true);
        await requestPasswordResetApi(email);
        setLoading(false);
        toast({
            description: t("email_sent"),
            position: "top",
            status: "success",
            duration: 10000,
            isClosable: true,
        });
        setEmail("");
    };

    return (
        <Flex minH="80vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} onSubmit={handleSubmit} w="full">
                    <Heading size="lg" color={COLOR_1} textAlign="center">
                        {t("forgot_heading")}
                    </Heading>

                    {error && (
                        <Alert status="error" rounded="md" w="full">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <FormControl id="email">
                        <FormLabel color={COLOR_1}>{t("email_label")}</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </FormControl>

                    <Button
                        w="full"
                        size="lg"
                        rounded="lg"
                        bg={COLOR_3}
                        color={COLOR_4}
                        _hover={{ bg: "teal" }}
                        type="submit"
                        isDisabled={hasErrors}
                        isLoading={loading}
                    >
                        {t("send_email_button")}
                    </Button>

                    <Link fontSize="sm" color="blue.500" as={RouterLink} to="/account/login">
                        {t("back_to_login")}
                    </Link>
                </VStack>
            </Box>
        </Flex>
    );
};

export default ForgotPassword;

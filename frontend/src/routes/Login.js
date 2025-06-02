import {
    Box,
    Flex,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    Text,
    Link,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";
import { useLang } from "../contexts/useLang.js";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { authLogin } = useAuth();
    const { t } = useLang();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const me = await authLogin(username, password);
            navigate(`/${me.username}`);
        } catch {
            setError(t("login_error"));
        }
    };

    return (
        <Flex minH="80vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} onSubmit={handleSubmit} w="full">
                    <Heading size="lg" color={COLOR_1} textAlign="center">
                        {t("login_heading")}
                    </Heading>

                    {error && (
                        <Alert status="error" rounded="md" w="full">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <FormControl id="username">
                        <FormLabel color={COLOR_1}>{t("username_label")}</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </FormControl>

                    <FormControl id="password">
                        <FormLabel color={COLOR_1}>{t("password_label")}</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </FormControl>

                    <Link
                        fontSize="sm"
                        color="blue.500"
                        as={RouterLink}
                        to="/account/forgot-password"
                        alignSelf="flex-start"
                    >
                        {t("forgot_password_link")}
                    </Link>

                    <Button
                        w="full"
                        size="lg"
                        rounded="lg"
                        bg={COLOR_3}
                        color={COLOR_4}
                        _hover={{ bg: "teal" }}
                        type="submit"
                        isDisabled={!username || !password}
                    >
                        {t("login_button")}
                    </Button>

                    <Text fontSize="sm" color={COLOR_1}>
                        {t("signup_prompt")}{" "}
                        <Link color="blue.500" as={RouterLink} to="/account/register">
                            {t("signup_link")}
                        </Link>
                        .
                    </Text>
                </VStack>
            </Box>
        </Flex>
    );
};

export default Login;

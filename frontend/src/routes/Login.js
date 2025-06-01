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

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const me = await authLogin(username, password);
            navigate(`/${me.username}`);
        } catch {
            setError("nimi lipu anu nimi len li suli");
        }
    };

    return (
        <Flex minH="80vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} onSubmit={handleSubmit} w="full">
                    <Heading size="lg" color={COLOR_1} textAlign="center">
                        o kama lon insa
                    </Heading>

                    {error && (
                        <Alert status="error" rounded="md" w="full">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <FormControl id="username">
                        <FormLabel color={COLOR_1}>nimi lipu</FormLabel>
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
                        <FormLabel color={COLOR_1}>nimi len</FormLabel>
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
                        mi pini sona e nimi len.
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
                        o pana
                    </Button>

                    <Text fontSize="sm" color={COLOR_1}>
                        sina sin anu seme?{" "}
                        <Link color="blue.500" as={RouterLink} to="/account/register">
                            o pana e lipu sin
                        </Link>
                        .
                    </Text>
                </VStack>
            </Box>
        </Flex>
    );
};

export default Login;

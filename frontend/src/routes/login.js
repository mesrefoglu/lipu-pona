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
import { Link as RouterLink } from "react-router-dom";

import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error] = useState("");
    const { authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        authLogin(username, password);
    };

    return (
        <Flex minH="80vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} onSubmit={handleSubmit} w="full">
                    <Heading size="lg" color={COLOR_1} textAlign="center">
                        kama lon insa
                    </Heading>

                    {error && (
                        <Alert status="error" rounded="md" w="full">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <FormControl id="username">
                        <FormLabel color={COLOR_1}>nimi lipu</FormLabel>
                        <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </FormControl>

                    <FormControl id="password">
                        <FormLabel color={COLOR_1}>nimi len</FormLabel>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </FormControl>

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
                        pana
                    </Button>

                    <Text fontSize="sm" color={COLOR_1}>
                        sina sin anu seme?{" "}
                        <Link as={RouterLink} to="/account/register" color="blue.500" fontWeight="semibold">
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

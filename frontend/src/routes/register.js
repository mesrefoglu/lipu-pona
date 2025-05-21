import {
    Flex,
    Box,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    FormErrorMessage,
    Text,
    Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import { registerApi } from "../api/endpoints.js";
import { useAuth } from "../contexts/useAuth.js";
import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";

const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const getErrors = ({ username, email, password, confirmPassword }) => ({
    username: !username
        ? "nimi lipu li wile."
        : usernameRegex.test(username)
        ? ""
        : "nimi ilo li wile lon 3-20 sitelen. sitelen ni li ken jo e sitelen nimi en sitelen nanpa.",
    email: !email ? "lipu toki ilo li wile." : emailRegex.test(email) ? "" : "o pana e lipu toki ilo pona.",
    password: !password
        ? "nimi len li wile."
        : passwordRegex.test(password)
        ? ""
        : "nimi len sina li wile lon suli 8 sitelen. nimi li wile jo e sitelen nimi en sitelen nanpa.",
    confirmPassword: !confirmPassword
        ? "o pana e nimi len a."
        : confirmPassword === password
        ? ""
        : "nimi len li sama ala.",
});

const Register = () => {
    const [values, setValues] = useState({
        username: "",
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
    });

    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const navigate = useNavigate();
    const { authLogin } = useAuth(); // ← NEW

    const errors = getErrors(values);
    const hasErrors = Object.values(errors).some(Boolean);

    const handleChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

    const handleBlur = (field) => setTouched((t) => ({ ...t, [field]: true }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({
            username: true,
            email: true,
            password: true,
            confirmPassword: true,
        });
        if (hasErrors) return;

        const { username, name, email, password } = values;
        const data = await registerApi(username, name, email, password);

        if (data.username) {
            await authLogin(username, password);
            navigate("/");
        }
    };

    const fieldProps = (id) => ({
        value: values[id],
        onChange: handleChange(id),
        onBlur: () => handleBlur(id),
    });

    return (
        <Flex minH="85vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} w="full" onSubmit={handleSubmit}>
                    <Heading size="lg" textAlign="center" color={COLOR_1}>
                        pana e lipu sin
                    </Heading>

                    <FormControl id="username" isInvalid={touched.username && !!errors.username}>
                        <FormLabel color={COLOR_1}>nimi lipu</FormLabel>
                        <Input type="text" {...fieldProps("username")} />
                        {touched.username && errors.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="name">
                        <FormLabel color={COLOR_1}>nimi</FormLabel>
                        <Input type="text" {...fieldProps("name")} />
                    </FormControl>

                    <FormControl id="email" isInvalid={touched.email && !!errors.email}>
                        <FormLabel color={COLOR_1}>lipu toki ilo</FormLabel>
                        <Input type="email" {...fieldProps("email")} />
                        {touched.email && errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="password" isInvalid={touched.password && !!errors.password}>
                        <FormLabel color={COLOR_1}>nimi len</FormLabel>
                        <Input type="password" {...fieldProps("password")} />
                        {touched.password && errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="confirmPassword" isInvalid={touched.confirmPassword && !!errors.confirmPassword}>
                        <FormLabel color={COLOR_1}>nimi len a</FormLabel>
                        <Input type="password" {...fieldProps("confirmPassword")} />
                        {touched.confirmPassword && errors.confirmPassword && (
                            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                        )}
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
                    >
                        pana
                    </Button>

                    <Text fontSize="sm" color={COLOR_1}>
                        sina kulupu ni anu seme?{" "}
                        <Link as={RouterLink} to="/account/login" color="blue.500" fontWeight="semibold">
                            o kama lon insa
                        </Link>
                        .
                    </Text>
                </VStack>
            </Box>
        </Flex>
    );
};

export default Register;

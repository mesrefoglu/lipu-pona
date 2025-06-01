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
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";
import { registerApi, checkUsernameApi, checkEmailApi } from "../api/endpoints.js";

const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const nameRegex = /^[aeijklmnopstuwAEIJKLMNOPSTUW ]{0,50}$/;
const emailRegex = /^(?=.{5,200}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const checkForLength = (str, min, max) => {
    return str.length >= min && str.length <= max;
};

const getErrors = (fields, usernameTaken, emailTaken) => ({
    username: !fields.username
        ? "nimi lipu li wile."
        : !checkForLength(fields.username, 3, 20)
        ? "nimi ilo li wile ja e 3-20 sitelen."
        : !usernameRegex.test(fields.username)
        ? "nimi lipu li wile ja e sitelen a-z, A-Z, 0-9."
        : usernameTaken
        ? "nimi lipu ni li lon. o ante."
        : "",
    name: !checkForLength(fields.name, 0, 50)
        ? "nimi li wile ja e 0-50 sitelen."
        : !nameRegex.test(fields.name)
        ? "nimi li wile ja e sitelen pi toki pona."
        : "",
    email: !fields.email
        ? "lipu toki ilo li wile."
        : !emailRegex.test(fields.email)
        ? "o pana e lipu toki ilo pona."
        : emailTaken
        ? "lipu toki ilo ni li lon. o ante."
        : "",
    password: !fields.password
        ? "nimi len li wile."
        : !checkForLength(fields.password, 8, 100)
        ? "nimi len li wile ja e 8-100 sitelen."
        : !passwordRegex.test(fields.password)
        ? "nimi len li wile ja e sitelen wan. ni li wile ja sitelen nanpa wan kin."
        : "",
    confirmPassword: !fields.confirmPassword
        ? "o pana e nimi len a."
        : fields.confirmPassword !== fields.password
        ? "nimi len li sama ala."
        : "",
});

const Register = () => {
    const [values, setValues] = useState({
        username: "",
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
    });
    const [touched, setTouched] = useState({});
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [emailTaken, setEmailTaken] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { authLogin } = useAuth();

    const errors = getErrors(values, usernameTaken, emailTaken);
    const hasErrors = Object.values(errors).some(Boolean);

    const handleChange = (field) => (e) => {
        const val = e.target.value;
        setValues((v) => ({ ...v, [field]: val }));
        if (field === "username") setUsernameTaken(false);
        if (field === "email") setEmailTaken(false);
    };

    const handleBlur = async (field) => {
        setTouched((t) => ({ ...t, [field]: true }));
        if (field === "username" && usernameRegex.test(values.username)) {
            setUsernameTaken(await checkUsernameApi(values.username));
        }
        if (field === "email" && emailRegex.test(values.email)) {
            setEmailTaken(await checkEmailApi(values.email));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ username: true, email: true, password: true, confirmPassword: true });
        setError("");

        if (hasErrors) return;
        try {
            const { username, name, email, password } = values;
            await registerApi(username, name, email, password);
            const me = await authLogin(username, password);
            navigate(`/${me.username}`);
        } catch {
            setError("pilin ike: o pali sin.");
        }
    };

    return (
        <Flex minH="85vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} w="full" onSubmit={handleSubmit}>
                    <Heading size="lg" textAlign="center" color={COLOR_1}>
                        o pana e lipu sin
                    </Heading>

                    {error && (
                        <Alert status="error" rounded="md" w="full">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <FormControl id="username" isInvalid={touched.username && !!errors.username}>
                        <FormLabel color={COLOR_1}>nimi lipu</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="text"
                            {...{
                                value: values.username,
                                onChange: handleChange("username"),
                                onBlur: () => handleBlur("username"),
                            }}
                        />
                        {touched.username && errors.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="name" isInvalid={touched.name && !!errors.name}>
                        <FormLabel color={COLOR_1}>nimi</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="text"
                            {...{
                                value: values.name,
                                onChange: handleChange("name"),
                                onBlur: () => handleBlur("name"),
                            }}
                        />
                        {touched.name && errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="email" isInvalid={touched.email && !!errors.email}>
                        <FormLabel color={COLOR_1}>lipu toki ilo</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="email"
                            {...{
                                value: values.email,
                                onChange: handleChange("email"),
                                onBlur: () => handleBlur("email"),
                            }}
                        />
                        {touched.email && errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="password" isInvalid={touched.password && !!errors.password}>
                        <FormLabel color={COLOR_1}>nimi len</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="password"
                            {...{ value: values.password, onChange: handleChange("password") }}
                        />
                        {touched.password && errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="confirmPassword" isInvalid={touched.confirmPassword && !!errors.confirmPassword}>
                        <FormLabel color={COLOR_1}>nimi len a</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="password"
                            {...{
                                value: values.confirmPassword,
                                onChange: handleChange("confirmPassword"),
                            }}
                        />
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
                        isDisabled={hasErrors || usernameTaken || emailTaken}
                    >
                        o pana
                    </Button>

                    <Text fontSize="sm" color={COLOR_1}>
                        sina sin anu seme?{" "}
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

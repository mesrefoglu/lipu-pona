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
    Checkbox,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import { COLOR_1, COLOR_3, COLOR_4, PASSWORD_REGEX } from "../constants/constants.js";
import { registerApi, checkUsernameApi, checkEmailApi } from "../api/endpoints.js";
import { useLang } from "../contexts/useLang.js";

const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const nameRegex = /^[aeijklmnopstuwAEIJKLMNOPSTUW ]{0,50}$/;
const emailRegex = /^(?=.{5,200}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;

const checkForLength = (str, min, max) => str.length >= min && str.length <= max;

const Register = () => {
    const [values, setValues] = useState({
        username: "",
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
        accepted: false,
    });
    const [touched, setTouched] = useState({});
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [emailTaken, setEmailTaken] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { t } = useLang();

    const getErrors = () => ({
        username: !values.username
            ? t("register_username_required")
            : !checkForLength(values.username, 3, 20)
            ? t("register_username_length")
            : !usernameRegex.test(values.username)
            ? t("register_username_format")
            : usernameTaken
            ? t("register_username_taken")
            : "",
        name: !checkForLength(values.name, 0, 50)
            ? t("register_name_length")
            : !nameRegex.test(values.name)
            ? t("register_name_format")
            : "",
        email: !values.email
            ? t("register_email_required")
            : !emailRegex.test(values.email)
            ? t("register_email_format")
            : emailTaken
            ? t("register_email_taken")
            : "",
        password: !values.password
            ? t("register_password_required")
            : !checkForLength(values.password, 8, 100)
            ? t("register_password_length")
            : !PASSWORD_REGEX.test(values.password)
            ? t("register_password_format")
            : "",
        confirmPassword: !values.confirmPassword
            ? t("register_confirm_required")
            : values.confirmPassword !== values.password
            ? t("register_confirm_mismatch")
            : "",
        accepted: !values.accepted ? "You must accept the Terms of Service and Privacy Policy." : "",
    });

    const errors = getErrors();
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
        setTouched({
            username: true,
            email: true,
            name: true,
            password: true,
            confirmPassword: true,
            accepted: true,
        });
        setError("");
        if (hasErrors) return;
        try {
            const { username, name, email, password } = values;
            const res = await registerApi(username, name, email, password);
            if (res.success) {
                navigate("/account/email-sent");
            } else {
                setError(t("register_error"));
            }
        } catch {
            setError(t("register_error"));
        }
    };

    return (
        <Flex minH="85vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} w="full" onSubmit={handleSubmit}>
                    <Heading size="lg" textAlign="center" color={COLOR_1}>
                        {t("register_heading")}
                    </Heading>

                    {error && (
                        <Alert status="error" rounded="md" w="full">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <FormControl id="username" isInvalid={touched.username && !!errors.username}>
                        <FormLabel color={COLOR_1}>{t("username_label")}</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="text"
                            value={values.username}
                            onChange={handleChange("username")}
                            onBlur={() => handleBlur("username")}
                            autoComplete="username"
                        />
                        {touched.username && errors.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="name" isInvalid={touched.name && !!errors.name}>
                        <FormLabel color={COLOR_1}>{t("name_label")}</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="text"
                            value={values.name}
                            onChange={handleChange("name")}
                            onBlur={() => handleBlur("name")}
                        />
                        {touched.name && errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="email" isInvalid={touched.email && !!errors.email}>
                        <FormLabel color={COLOR_1}>{t("email_label")}</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="email"
                            value={values.email}
                            onChange={handleChange("email")}
                            onBlur={() => handleBlur("email")}
                            autoComplete="email"
                        />
                        {touched.email && errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="password" isInvalid={touched.password && !!errors.password}>
                        <FormLabel color={COLOR_1}>{t("password_label")}</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="password"
                            value={values.password}
                            onChange={handleChange("password")}
                            autoComplete="new-password"
                        />
                        {touched.password && errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="confirmPassword" isInvalid={touched.confirmPassword && !!errors.confirmPassword}>
                        <FormLabel color={COLOR_1}>{t("confirm_password_label")}</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="password"
                            value={values.confirmPassword}
                            onChange={handleChange("confirmPassword")}
                            autoComplete="new-password"
                        />
                        {touched.confirmPassword && errors.confirmPassword && (
                            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                        )}
                    </FormControl>

                    <FormControl id="accepted" isInvalid={touched.accepted && !!errors.accepted}>
                        <Checkbox
                            isChecked={values.accepted}
                            onChange={(e) => setValues((v) => ({ ...v, accepted: e.target.checked }))}
                            colorScheme="teal"
                        >
                            I accept the{" "}
                            <Link as={RouterLink} to="/site/legal/tos" color="blue.500" target="_blank">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link as={RouterLink} to="/site/legal/privacy-policy" color="blue.500" target="_blank">
                                Privacy Policy
                            </Link>
                            .
                        </Checkbox>
                        {touched.accepted && errors.accepted && <FormErrorMessage>{errors.accepted}</FormErrorMessage>}
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
                        {t("register_button")}
                    </Button>

                    <Text fontSize="sm" color={COLOR_1}>
                        {t("already_have_account")}{" "}
                        <Link as={RouterLink} to="/account/login" color="blue.500">
                            {t("login_link")}
                        </Link>
                        .
                    </Text>
                </VStack>
            </Box>
        </Flex>
    );
};

export default Register;

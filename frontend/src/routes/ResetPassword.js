import {
    Box,
    Flex,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    FormErrorMessage,
    Alert,
    AlertIcon,
    useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { COLOR_1, COLOR_3, COLOR_4, PASSWORD_REGEX } from "../constants/constants.js";
import { confirmPasswordResetApi } from "../api/endpoints.js";
import { useAuth } from "../contexts/useAuth.js";
import { useLang } from "../contexts/useLang.js";

const ResetPassword = () => {
    const { uid, token } = useParams();
    const { authLogin } = useAuth();
    const toast = useToast();
    const { t } = useLang();

    const [values, setValues] = useState({ newPassword: "", confirmPassword: "" });
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const errors = {
        newPassword: !values.newPassword
            ? t("register_password_required")
            : !PASSWORD_REGEX.test(values.newPassword)
            ? t("register_password_length")
            : "",
        confirmPassword: !values.confirmPassword
            ? t("register_confirm_required")
            : values.newPassword !== values.confirmPassword
            ? t("register_confirm_mismatch")
            : "",
    };

    const hasErrors = Object.values(errors).some(Boolean);

    const handleChange = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
    const handleBlur = (field) => setTouched((t) => ({ ...t, [field]: true }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ newPassword: true, confirmPassword: true });
        if (hasErrors) return;
        setLoading(true);
        try {
            const { username } = await confirmPasswordResetApi(uid, token, values.newPassword);
            await authLogin(username, values.newPassword);
            toast({
                description: t("reset_success"),
                position: "top",
                status: "success",
                duration: 10000,
                isClosable: true,
            });
        } catch {
            setError(t("reset_error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex minH="80vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} w="full" onSubmit={handleSubmit}>
                    <Heading size="lg" textAlign="center" color={COLOR_1}>
                        {t("reset_heading")}
                    </Heading>

                    {error && (
                        <Alert status="error" rounded="md" w="full">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <FormControl id="newPassword" isInvalid={touched.newPassword && !!errors.newPassword}>
                        <FormLabel color={COLOR_1}>{t("password_label_new")}</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="password"
                            value={values.newPassword}
                            onChange={handleChange("newPassword")}
                            onBlur={() => handleBlur("newPassword")}
                        />
                        {touched.newPassword && errors.newPassword && (
                            <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
                        )}
                    </FormControl>

                    <FormControl id="confirmPassword" isInvalid={touched.confirmPassword && !!errors.confirmPassword}>
                        <FormLabel color={COLOR_1}>{t("confirm_password_label")}</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="password"
                            value={values.confirmPassword}
                            onChange={handleChange("confirmPassword")}
                            onBlur={() => handleBlur("confirmPassword")}
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
                        isDisabled={hasErrors}
                        isLoading={loading}
                    >
                        {t("register_button")}
                    </Button>
                </VStack>
            </Box>
        </Flex>
    );
};

export default ResetPassword;

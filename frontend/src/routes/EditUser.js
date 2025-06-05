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
    Alert,
    AlertIcon,
    Textarea,
    Image,
    IconButton,
    useToast,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { FiUpload, FiX } from "react-icons/fi";

import { COLOR_1, COLOR_2, COLOR_3, COLOR_4, PASSWORD_REGEX } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";
import { useLang } from "../contexts/useLang.js";
import { checkUsernameApi, editUserApi, deleteUserApi } from "../api/endpoints.js";
import ConfirmDialog from "../components/ConfirmDialogue.js";

const MAX_CHARS = 250;
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const nameRegex = /^[aeijklmnopstuwAEIJKLMNOPSTUW ]{0,50}$/;

const checkForLength = (str, min, max) => str.length >= min && str.length <= max;

const getErrors = (fields, usernameTaken, t) => ({
    username: !fields.username
        ? t("username_required")
        : !checkForLength(fields.username, 3, 20)
        ? t("username_length")
        : !usernameRegex.test(fields.username)
        ? t("username_invalid_chars")
        : usernameTaken
        ? t("username_taken")
        : "",
    name: !checkForLength(fields.name, 0, 50)
        ? t("name_length")
        : !nameRegex.test(fields.name)
        ? t("name_invalid_chars")
        : "",
    currentPassword: fields.newPassword && !fields.currentPassword ? t("current_password_required") : "",
    newPassword: !fields.newPassword
        ? ""
        : !checkForLength(fields.newPassword, 8, 100)
        ? t("new_password_length")
        : !PASSWORD_REGEX.test(fields.newPassword)
        ? t("new_password_complexity")
        : "",
    confirmPassword:
        fields.newPassword && !fields.confirmPassword
            ? t("confirm_password_required")
            : fields.confirmPassword !== fields.newPassword
            ? t("confirm_password_mismatch")
            : "",
});

const EditUser = () => {
    const fileInputRef = useRef();
    const { user, setUser, authLogin, logout } = useAuth();
    const { t } = useLang();
    const toast = useToast();
    const originalUsername = useRef(user?.username || "").current;
    const navigate = useNavigate();

    const [values, setValues] = useState({
        email: user?.email || "",
        username: user?.username || "",
        name: user?.first_name || "",
        bio: user?.bio || "",
        newPassword: "",
        confirmPassword: "",
        currentPassword: "",
    });

    const [previewSrc, setPreviewSrc] = useState(user?.profile_picture || null);
    const [imageFile, setImageFile] = useState(null);
    const [removedPicture, setRemovedPicture] = useState(false);

    const [touched, setTouched] = useState({});
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [firstConfirmOpen, setFirstConfirmOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const errors = getErrors(values, usernameTaken, t);
    const hasErrors = Object.values(errors).some(Boolean);

    const handleChange = (field) => (e) => {
        const val = e.target.value;
        setValues((v) => ({ ...v, [field]: val }));
        if (field === "username") setUsernameTaken(false);
        if (field === "newPassword") {
            setValues((v) => ({ ...v, currentPassword: "", confirmPassword: "" }));
            setTouched((t) => ({ ...t, currentPassword: false, confirmPassword: false }));
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const blob = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                fileType: "image/jpeg",
            });
            const jpgFile = new File([blob], "img.jpg", { type: "image/jpeg" });
            setImageFile(jpgFile);
            setPreviewSrc(URL.createObjectURL(jpgFile));
            setRemovedPicture(false);
            setError("");
        } catch {
            setError(t("image_error"));
        }
    };

    const clearFile = () => {
        setImageFile(null);
        setPreviewSrc(null);
        setRemovedPicture(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleBlur = async (field) => {
        setTouched((tState) => ({ ...tState, [field]: true }));
        if (
            field === "username" &&
            values.username &&
            values.username !== originalUsername &&
            usernameRegex.test(values.username)
        ) {
            setUsernameTaken(await checkUsernameApi(values.username));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({
            username: true,
            name: true,
            bio: true,
            newPassword: true,
            confirmPassword: true,
            currentPassword: true,
        });
        setError("");
        if (hasErrors) return;

        const { success, error: apiError } = await editUserApi({
            username: values.username,
            name: values.name,
            bio: values.bio,
            imageFile,
            removedPicture,
            newPassword: values.newPassword,
            currentPassword: values.currentPassword,
        });

        if (!success) {
            if (apiError === "Current password is incorrect.") {
                setError(t("current_password_incorrect"));
            } else {
                setError(t("update_error_generic"));
            }
            return;
        }

        if (values.newPassword) {
            await authLogin(values.username, values.newPassword);
        } else {
            setUser({ ...values, first_name: values.name, profile_picture: previewSrc });
        }
        navigate(`/${values.username}`);

        toast({
            description: t("update_success"),
            placement: "top",
            status: "success",
            duration: 5000,
        });
    };

    return (
        <>
            <Flex minH="85vh" align="center" justify="center" px={4}>
                <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                    <VStack as="form" spacing={6} w="full" onSubmit={handleSubmit} align="flex-start">
                        <Heading size="lg" textAlign="center" mx="auto" color={COLOR_1}>
                            {t("edit_profile_heading")}
                        </Heading>
                        <FormControl id="email">
                            <FormLabel color={COLOR_1}>{t("email_label")}</FormLabel>
                            <Input
                                borderColor="gray.400"
                                _hover={{ borderColor: COLOR_3 }}
                                value={values.email}
                                isDisabled
                            />
                            <FormErrorMessage color={COLOR_2}>${t("email_cant_be_changed")}</FormErrorMessage>
                        </FormControl>

                        <FormControl id="username" isInvalid={touched.username && !!errors.username}>
                            <FormLabel color={COLOR_1}>{t("username_label")}</FormLabel>
                            <Input
                                borderColor="gray.400"
                                _hover={{ borderColor: COLOR_3 }}
                                value={values.username}
                                onChange={handleChange("username")}
                                onBlur={() => handleBlur("username")}
                            />
                            {touched.username && errors.username && (
                                <FormErrorMessage>{errors.username}</FormErrorMessage>
                            )}
                        </FormControl>

                        <FormControl id="name" isInvalid={touched.name && !!errors.name}>
                            <FormLabel color={COLOR_1}>{t("name_label")}</FormLabel>
                            <Input
                                borderColor="gray.400"
                                _hover={{ borderColor: COLOR_3 }}
                                value={values.name}
                                onChange={handleChange("name")}
                                onBlur={() => handleBlur("name")}
                            />
                            {touched.name && errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
                        </FormControl>

                        <FormControl id="bio">
                            <FormLabel color={COLOR_1}>{t("bio_label")}</FormLabel>
                            <Box position="relative" w="full">
                                <Textarea
                                    value={values.bio}
                                    onChange={handleChange("bio")}
                                    h="150px"
                                    resize="none"
                                    overflowY="auto"
                                    borderColor="gray.400"
                                    color={COLOR_1}
                                    _hover={{ borderColor: COLOR_3 }}
                                    maxLength={MAX_CHARS}
                                />
                                <Text
                                    fontSize="xs"
                                    color={values.bio.length === MAX_CHARS ? "red.500" : "orange.500"}
                                    position="absolute"
                                    bottom={2}
                                    right={3}
                                    pointerEvents="none"
                                >
                                    {values.bio.length > MAX_CHARS - 100 ? MAX_CHARS - values.bio.length : ""}
                                </Text>
                            </Box>
                        </FormControl>

                        <FormControl id="profile_picture">
                            <FormLabel color={COLOR_1}>{t("profile_picture_label")}</FormLabel>
                            <input
                                type="file"
                                accept=".jpg, .jpeg, .png, .webp, .bmp"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                style={{ display: "none" }}
                            />
                            <Button
                                leftIcon={<FiUpload />}
                                onClick={() => fileInputRef.current.click()}
                                bg={COLOR_3}
                                color={COLOR_4}
                                _hover={{ bg: "teal" }}
                            >
                                {previewSrc ? t("change_image_button") : t("upload_image_button")}
                            </Button>

                            {previewSrc && (
                                <Box position="relative" w="full" mt={2}>
                                    <Image
                                        src={previewSrc}
                                        alt="preview"
                                        borderRadius="md"
                                        objectFit="cover"
                                        w="full"
                                    />
                                    <IconButton
                                        icon={<FiX />}
                                        size="sm"
                                        position="absolute"
                                        top={2}
                                        right={2}
                                        bg="rgba(0,0,0,0.6)"
                                        color="white"
                                        onClick={clearFile}
                                    />
                                </Box>
                            )}
                        </FormControl>

                        <FormControl id="newPassword" isInvalid={touched.newPassword && !!errors.newPassword}>
                            <FormLabel color={COLOR_1}>{t("new_password_label")}</FormLabel>
                            <Input
                                borderColor="gray.400"
                                _hover={{ borderColor: COLOR_3 }}
                                type="password"
                                value={values.newPassword}
                                onChange={handleChange("newPassword")}
                                onBlur={() => handleBlur("newPassword")}
                                autoComplete="new-password"
                            />
                            {touched.newPassword && errors.newPassword && (
                                <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
                            )}
                        </FormControl>

                        <FormControl
                            id="confirmPassword"
                            isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                        >
                            <FormLabel color={COLOR_1}>{t("confirm_password_label")}</FormLabel>
                            <Input
                                borderColor="gray.400"
                                _hover={{ borderColor: COLOR_3 }}
                                type="password"
                                value={values.confirmPassword}
                                onChange={handleChange("confirmPassword")}
                                onBlur={() => handleBlur("confirmPassword")}
                                autoComplete="new-password"
                            />
                            {touched.confirmPassword && errors.confirmPassword && (
                                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                            )}
                        </FormControl>

                        <FormControl
                            id="currentPassword"
                            isInvalid={touched.currentPassword && !!errors.currentPassword}
                        >
                            <FormLabel color={COLOR_1}>{t("current_password_label")}</FormLabel>
                            <Input
                                borderColor="gray.400"
                                _hover={{ borderColor: COLOR_3 }}
                                type="password"
                                value={values.currentPassword}
                                onChange={handleChange("currentPassword")}
                                onBlur={() => handleBlur("currentPassword")}
                                disabled={!values.newPassword}
                            />
                            {touched.currentPassword && errors.currentPassword && (
                                <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
                            )}
                        </FormControl>

                        {error && (
                            <Alert status="error" rounded="md" w="full">
                                <AlertIcon />
                                {error}
                            </Alert>
                        )}

                        <Button
                            w="full"
                            size="lg"
                            rounded="lg"
                            bg={COLOR_3}
                            color={COLOR_4}
                            _hover={{ bg: "teal" }}
                            type="submit"
                            isDisabled={hasErrors || usernameTaken}
                        >
                            {t("save_button")}
                        </Button>

                        <Button
                            size="md"
                            rounded="lg"
                            bg="transparent"
                            border="2px"
                            borderColor="red.500"
                            color="red.500"
                            _hover={{ bg: "red.500", color: COLOR_4 }}
                            onClick={() => setFirstConfirmOpen(true)}
                            isLoading={deleting}
                        >
                            {t("delete_account_button")}
                        </Button>
                    </VStack>
                </Box>
            </Flex>

            <ConfirmDialog
                isOpen={firstConfirmOpen}
                onClose={() => setFirstConfirmOpen(false)}
                onConfirm={() => {
                    setConfirmOpen(true);
                    setFirstConfirmOpen(false);
                }}
                title="Delete your account?"
                description="All your posts, comments, and images will be permanently removed. This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                headerTextColor={COLOR_1}
                bodyTextColor={COLOR_1}
                cancelButtonColorScheme="gray"
                confirmButtonColorScheme="red"
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={async () => {
                    setDeleting(true);
                    try {
                        await deleteUserApi();
                        logout();
                    } catch {
                        setError(t("update_error_generic"));
                    } finally {
                        setDeleting(false);
                        setConfirmOpen(false);
                        navigate("/account/login");
                        toast({
                            description: t("delete_account_success"),
                            placement: "top",
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                }}
                title="Are you sure?"
                description="Final warning. Press delete if you want to proceed with deleting your account."
                confirmText="Delete"
                cancelText="Cancel"
                headerTextColor={COLOR_1}
                bodyTextColor={COLOR_1}
                cancelButtonColorScheme="gray"
                confirmButtonColorScheme="red"
            />
        </>
    );
};

export default EditUser;

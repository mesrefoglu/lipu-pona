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

import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";
import { checkUsernameApi, editUserApi } from "../api/endpoints.js";

const MAX_CHARS = 250;
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const nameRegex = /^[aeijklmnopstuwAEIJKLMNOPSTUW ]{0,50}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const checkForLength = (str, min, max) => {
    return str.length >= min && str.length <= max;
};

const getErrors = (fields, usernameTaken) => ({
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
    currentPassword: fields.newPassword && !fields.currentPassword ? "nimi len pi tenpo ni li wile." : "",
    newPassword: !fields.newPassword
        ? ""
        : !checkForLength(fields.newPassword, 8, 100)
        ? "nimi len li wile ja e 8-100 sitelen."
        : !passwordRegex.test(fields.newPassword)
        ? "nimi len li wile ja e sitelen wan. ni li wile ja sitelen nanpa wan kin."
        : "",
    confirmPassword:
        fields.newPassword && !fields.confirmPassword
            ? "o pana e nimi len a."
            : fields.confirmPassword !== fields.newPassword
            ? "nimi len li sama ala."
            : "",
});

const EditUser = () => {
    const fileInputRef = useRef();
    const { user, setUser, authLogin } = useAuth();
    const toast = useToast();
    const originalUsername = useRef(user?.username || "").current;
    const navigate = useNavigate();

    const [values, setValues] = useState({
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
    const [error, setError] = useState("");

    const errors = getErrors(values, usernameTaken);
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
            const jpgFile = new File([blob], "img.jpg", {
                type: "image/jpeg",
            });
            setImageFile(jpgFile);
            setPreviewSrc(URL.createObjectURL(jpgFile));
            setRemovedPicture(false);
            setError("");
        } catch {
            setError("sitelen musi li ike! compression failed.");
        }
    };

    const clearFile = () => {
        setImageFile(null);
        setPreviewSrc(null);
        setRemovedPicture(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleBlur = async (field) => {
        setTouched((t) => ({ ...t, [field]: true }));
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
        const { success, error } = await editUserApi({
            username: values.username,
            name: values.name,
            bio: values.bio,
            imageFile,
            removedPicture,
            newPassword: values.newPassword,
            currentPassword: values.currentPassword,
        });

        if (!success) {
            if (error === "Current password is incorrect.") {
                setError("nimi len pi tenpo ni li ike.");
            } else {
                setError("pilin ike: o pali sin.");
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
            description: "Ala li pona!",
            placement: "top",
            status: "success",
            duration: 5000,
        });
    };

    return (
        <Flex minH="85vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} w="full" onSubmit={handleSubmit}>
                    <Heading size="lg" textAlign="center" color={COLOR_1}>
                        o ante e lipu mi
                    </Heading>

                    <FormControl id="username" isInvalid={touched.username && !!errors.username}>
                        <FormLabel color={COLOR_1}>nimi lipu</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="text"
                            value={values.username}
                            onChange={handleChange("username")}
                            onBlur={() => handleBlur("username")}
                        />
                        {touched.username && errors.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
                    </FormControl>

                    <FormControl id="name" isInvalid={touched.name && !!errors.name}>
                        <FormLabel color={COLOR_1}>nimi</FormLabel>
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

                    <FormControl id="bio">
                        <FormLabel color={COLOR_1}>sona mi</FormLabel>
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
                        <FormLabel color={COLOR_1}>sitelen mi</FormLabel>
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
                            {previewSrc ? "o ante e sitelen ni" : "o pana e sitelen"}
                        </Button>

                        {previewSrc && (
                            <Box position="relative" w="full" mt={2}>
                                <Image src={previewSrc} alt="preview" borderRadius="md" objectFit="cover" w="full" />
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
                        <FormLabel color={COLOR_1}>nimi len sin</FormLabel>
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

                    <FormControl id="confirmPassword" isInvalid={touched.confirmPassword && !!errors.confirmPassword}>
                        <FormLabel color={COLOR_1}>nimi len sin a</FormLabel>
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

                    <FormControl id="currentPassword" isInvalid={touched.currentPassword && !!errors.currentPassword}>
                        <FormLabel color={COLOR_1}>nimi len pi tenpo ni</FormLabel>
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
                        o pana
                    </Button>
                </VStack>
            </Box>
        </Flex>
    );
};

export default EditUser;

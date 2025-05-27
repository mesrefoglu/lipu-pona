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
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";
import { editUserApi, checkUsernameApi } from "../api/endpoints.js";
import { FiUpload, FiX } from "react-icons/fi";

const MAX_CHARS = 250;

const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const getErrors = (fields, usernameTaken) => ({
    username: !fields.username
        ? "nimi lipu li wile."
        : !usernameRegex.test(fields.username)
        ? "nimi ilo li wile lon 3-20 sitelen."
        : usernameTaken
        ? "nimi lipu ni li lon. o ante."
        : "",
    currentPassword: fields.newPassword && !fields.currentPassword ? "nimi len pi tenpo ni li wile." : "",

    newPassword:
        fields.newPassword && !passwordRegex.test(fields.newPassword)
            ? "nimi len sina li wile lon suli 8 sitelen."
            : "",
    confirmPassword:
        fields.password && !fields.confirmPassword
            ? "o pana e nimi len a."
            : fields.confirmPassword !== fields.newPassword
            ? "nimi len li sama ala."
            : "",
});

const EditUser = () => {
    const fileInputRef = useRef();
    const navigate = useNavigate();
    const { user, authLogin } = useAuth();

    const [touched, setTouched] = useState({});
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [values, setValues] = useState({
        username: user?.username || "",
        name: user?.first_name || "",
        bio: user?.bio || "",
        profile_picture: user?.profile_picture || "",
        newPassword: "",
        confirmPassword: "",
        currentPassword: "",
    });
    const originalValues = values;

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
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                fileType: "image/jpeg",
            };

            const compressedBlob = await imageCompression(file, options);

            const jpgFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: "image/jpeg",
            });

            setImageFile(jpgFile);
            setValues((v) => ({ ...v, profile_picture: "changed" }));
            setError("");
        } catch {
            setError("sitelen musi li ike! compression failed.");
        }
    };

    const clearFile = () => {
        if (imageFile) {
            setImageFile(null);
            setValues((v) => ({ ...v, profile_picture: "changed" }));
            if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
            setValues((v) => ({ ...v, profile_picture: "changed" }));
            setError("");
        }
    };

    const handleBlur = async (field) => {
        setTouched((t) => ({ ...t, [field]: true }));
        if (
            field === "username" &&
            values.username !== originalValues.username &&
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
            profile_picture: true,
            newPassword: true,
            confirmPassword: true,
            currentPassword: true,
        });
        setError("");

        if (hasErrors) return;
        try {
            if (values.profile_picture !== "changed") {
                setImageFile(null);
            }
            const { username, name, bio, imageFile, newPassword } = values;

            await editUserApi(username, name, bio, newPassword || undefined, imageFile);
            const me = await authLogin(username, newPassword);
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
                        o ante e lipu mi
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

                    <FormControl id="name">
                        <FormLabel color={COLOR_1}>nimi</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="text"
                            {...{ value: values.name, onChange: handleChange("name") }}
                        />
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
                            />
                            <Text
                                fontSize="xs"
                                color={values.bio.length === MAX_CHARS ? "red.500" : COLOR_1}
                                position="absolute"
                                bottom={2}
                                right={3}
                                pointerEvents="none"
                            >
                                {values.bio.length}/{MAX_CHARS}
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
                            {imageFile || values.profile_picture ? "o ante e sitelen ni" : "o pana e sitelen"}
                        </Button>

                        {(imageFile || values.profile_picture) && (
                            <Box position="relative" w="full" mt={2}>
                                <Image
                                    src={imageFile ? URL.createObjectURL(imageFile) : values.profile_picture || ""}
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
                                <Text mt={2} fontSize="sm" color={COLOR_1}>
                                    {imageFile?.name}
                                </Text>
                            </Box>
                        )}
                    </FormControl>

                    <FormControl id="newPassword" isInvalid={touched.newPassword && !!errors.newPassword}>
                        <FormLabel color={COLOR_1}>nimi len sin</FormLabel>
                        <Input
                            borderColor="gray.400"
                            _hover={{ borderColor: COLOR_3 }}
                            type="password"
                            {...{
                                value: values.newPassword,
                                onChange: handleChange("newPassword"),
                                onBlur: () => handleBlur("newPassword"),
                            }}
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
                            {...{
                                value: values.confirmPassword,
                                onChange: handleChange("confirmPassword"),
                                onBlur: () => handleBlur("confirmPassword"),
                            }}
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
                            {...{
                                value: values.currentPassword,
                                onChange: handleChange("currentPassword"),
                                onBlur: () => handleBlur("currentPassword"),
                            }}
                            disabled={!values.newPassword}
                        />
                        {touched.currentPassword && errors.currentPassword && (
                            <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
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

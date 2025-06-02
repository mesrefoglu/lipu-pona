import {
    Flex,
    Box,
    FormControl,
    Button,
    Textarea,
    Text,
    Alert,
    AlertIcon,
    Image,
    IconButton,
    VStack,
    HStack,
    Avatar,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { FiImage, FiSend, FiX } from "react-icons/fi";
import autosize from "autosize";

import { useAuth } from "../contexts/useAuth.js";
import { useLang } from "../contexts/useLang.js";
import { COLOR_3, COLOR_4 } from "../constants/constants.js";
import { createPostApi } from "../api/endpoints.js";

const MAX_CHARS = 1000;

const CreatePost = ({ onPostCreated }) => {
    const { user } = useAuth();
    const { t } = useLang();

    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");

    const textInputRef = useRef();
    const fileInputRef = useRef();

    const handleImageChange = async (e) => {
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
            setError("");
        } catch {
            setError(t("image_error"));
        }
    };

    const clearFile = () => {
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleTextChange = (e) => {
        setText(e.target.value.slice(0, MAX_CHARS));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) {
            setError(t("post_text_error"));
            return;
        }
        try {
            const res = await createPostApi(imageFile, text.trim());
            if (onPostCreated) onPostCreated(res);
            setText("");
            clearFile();
            setError("");
        } catch {
            setError(t("post_error"));
        }
    };

    useEffect(() => {
        const textAreaEl = textInputRef.current;
        autosize(textAreaEl);
        return () => {
            autosize.destroy(textAreaEl);
        };
    }, []);

    return (
        <Flex py={4} mx="auto">
            <Box w="full">
                <HStack align="start">
                    <Avatar size="md" src={user?.profile_picture || undefined} />
                    <VStack w="full" as="form" py={1.2} spacing={3} onSubmit={handleSubmit}>
                        {error && (
                            <Alert status="error" rounded="md" w="full">
                                <AlertIcon />
                                {error}
                            </Alert>
                        )}
                        <FormControl id="text" isRequired>
                            <Box position="relative" w="full">
                                <Textarea
                                    value={text}
                                    placeholder={t("create_placeholder")}
                                    onChange={handleTextChange}
                                    ref={textInputRef}
                                    rows={1}
                                    borderColor="transparent"
                                    _hover={{ borderColor: "transparent" }}
                                    focusBorderColor="transparent"
                                    color={COLOR_4}
                                />
                                <Text
                                    fontSize="xs"
                                    color={text.length === MAX_CHARS ? "red.500" : "orange.500"}
                                    position="absolute"
                                    bottom={2.5}
                                    right={3}
                                    pointerEvents="none"
                                >
                                    {text.length > MAX_CHARS - 100 ? MAX_CHARS - text.length : ""}
                                </Text>
                            </Box>
                        </FormControl>

                        {imageFile && (
                            <Box position="relative" w="full" mt={2}>
                                <Image
                                    src={URL.createObjectURL(imageFile)}
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

                        <HStack w="full">
                            <FormControl id="image">
                                <input
                                    type="file"
                                    accept=".jpg, .jpeg, .png, .webp, .bmp"
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                />
                                <Button
                                    leftIcon={<FiImage />}
                                    onClick={() => fileInputRef.current.click()}
                                    variant={"ghost"}
                                    color={COLOR_4}
                                    borderColor={COLOR_3}
                                    _hover={{ bg: COLOR_3 }}
                                >
                                    {imageFile ? t("change_image") : t("add_image")}
                                </Button>
                            </FormControl>

                            <Button
                                leftIcon={<FiSend />}
                                rounded="lg"
                                bg={COLOR_3}
                                color={COLOR_4}
                                _hover={{ bg: "teal" }}
                                type="submit"
                                isDisabled={!text.trim() || text.length > MAX_CHARS}
                            >
                                {t("create_button")}
                            </Button>
                        </HStack>
                    </VStack>
                </HStack>
            </Box>
        </Flex>
    );
};

export default CreatePost;

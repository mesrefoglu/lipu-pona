import {
    Flex,
    Box,
    Heading,
    FormControl,
    FormLabel,
    Button,
    Textarea,
    Text,
    Alert,
    AlertIcon,
    Image,
    IconButton,
    VStack,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiUpload } from "react-icons/fi";

import { createPostApi } from "../api/endpoints.js";
import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";

const MAX_CHARS = 1000;
const MAX_BYTES = 5 * 1024 * 1024;
const VALID_TYPES = ["image/jpeg", "image/png"];

const CreatePost = () => {
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const fileInputRef = useRef();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!VALID_TYPES.includes(file.type)) {
            setError("sitelen musi li ike! o pana e [.jpg] anu [.png].");
            clearFile();
            return;
        }
        if (file.size > MAX_BYTES) {
            setError("sike sitelen li suli sama 5 MB taso.");
            clearFile();
            return;
        }
        setError("");
        setImageFile(file);
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
            setError("sitelen nimi li wile.");
            return;
        }
        try {
            setLoading(true);
            const res = await createPostApi(imageFile, text.trim());
            navigate("/post/" + res.id);
        } catch {
            setError("pilin ike: post li ken ala kama.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex minH="85vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} w="full" onSubmit={handleSubmit}>
                    <Heading size="lg" textAlign="center" color={COLOR_1}>
                        o pana e lipu
                    </Heading>

                    {error && (
                        <Alert status="error" rounded="md" w="full">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <FormControl id="image">
                        <FormLabel color={COLOR_1}>sitelen (≤ 5 MB; png/jpg)</FormLabel>
                        <input
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            style={{ display: "none" }}
                        />
                        <Button
                            leftIcon={<FiUpload />}
                            onClick={() => fileInputRef.current.click()}
                            bg={COLOR_3}
                            color={COLOR_4}
                            _hover={{ bg: COLOR_1 }}
                        >
                            {imageFile ? "o ante e sitelen ni" : "o pana e sitelen"}
                        </Button>

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
                                <Text mt={2} fontSize="sm" color={COLOR_1}>
                                    {imageFile.name}
                                </Text>
                            </Box>
                        )}
                    </FormControl>

                    <FormControl id="text" isRequired>
                        <FormLabel color={COLOR_1}>sitelen nimi (≤ 1000)</FormLabel>
                        <Box position="relative" w="full">
                            <Textarea
                                value={text}
                                onChange={handleTextChange}
                                placeholder="o toki..."
                                h="150px"
                                resize="none"
                                overflowY="auto"
                                borderColor="gray.400"
                                color={COLOR_1}
                                _hover={{ borderColor: COLOR_3 }}
                            />
                            <Text
                                fontSize="xs"
                                color={text.length === MAX_CHARS ? "red.500" : COLOR_1}
                                position="absolute"
                                bottom={2}
                                right={3}
                                pointerEvents="none"
                            >
                                {text.length}/{MAX_CHARS}
                            </Text>
                        </Box>
                    </FormControl>

                    <Button
                        w="full"
                        size="lg"
                        rounded="lg"
                        bg={COLOR_3}
                        color={COLOR_4}
                        type="submit"
                        isLoading={loading}
                        isDisabled={!text.trim() || text.length > MAX_CHARS}
                    >
                        o pana
                    </Button>
                </VStack>
            </Box>
        </Flex>
    );
};

export default CreatePost;

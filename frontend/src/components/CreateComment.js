import {
    Flex,
    Box,
    FormControl,
    Button,
    Textarea,
    Text,
    Alert,
    AlertIcon,
    VStack,
    HStack,
    Avatar,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { FiSend } from "react-icons/fi";
import autosize from "autosize";

import { useAuth } from "../contexts/useAuth.js";
import { COLOR_3, COLOR_4 } from "../constants/constants.js";
import { createCommentApi } from "../api/endpoints.js";

const MAX_CHARS = 250;

const CreatePost = ({ onPostCreated }) => {
    const { user } = useAuth();

    const [text, setText] = useState("");
    const [error, setError] = useState("");

    const textInputRef = useRef();

    const postId = window.location.pathname.split("/").pop();

    const handleTextChange = (e) => {
        setText(e.target.value.slice(0, MAX_CHARS));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createCommentApi(postId, text.trim());
            if (onPostCreated) onPostCreated(res);
            setText("");
            setError("");
        } catch {
            setError("pilin ike: post li ken ala kama.");
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
        <Flex mx="auto">
            <Box w="full">
                <HStack align="start">
                    <Avatar size="md" src={user?.profile_picture || undefined} />
                    <VStack w="full" ml={2} spacing={2} as="form" onSubmit={handleSubmit}>
                        {error && (
                            <Alert status="error" rounded="md" w="full">
                                <AlertIcon />
                                {error}
                            </Alert>
                        )}
                        <FormControl id="text" isRequired>
                            <Box w="full">
                                <Textarea
                                    value={text}
                                    placeholder="o toki e ijo..."
                                    onChange={handleTextChange}
                                    ref={textInputRef}
                                    p={0}
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

                        <HStack w="full">
                            <Button
                                leftIcon={<FiSend />}
                                rounded="lg"
                                bg={COLOR_3}
                                color={COLOR_4}
                                _hover={{ bg: "teal" }}
                                type="submit"
                                isDisabled={!text.trim() || text.length > MAX_CHARS}
                            >
                                o toki
                            </Button>
                        </HStack>
                    </VStack>
                </HStack>
            </Box>
        </Flex>
    );
};

export default CreatePost;

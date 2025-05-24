import {
    Flex,
    Box,
    Heading,
    FormControl,
    FormLabel,
    Textarea,
    Button,
    VStack,
    Text,
    Alert,
    AlertIcon,
    Spinner,
    Center,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPostApi, editPostApi } from "../api/endpoints.js";
import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";

const MAX_CHARS = 1000;

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const post = await getPostApi(id);
                setText(post.text);
            } catch {
                setError("pilin ike: sitelen li ken ala kama.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleTextChange = (e) => {
        setText(e.target.value.slice(0, MAX_CHARS));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) {
            setError("sitelen nimi li wile.");
            return;
        }
        setSaving(true);
        try {
            const res = await editPostApi(id, text.trim());
            navigate(`/post/${res.id}`);
        } catch {
            setError("pilin ike: post li ken ala ante.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Center minH="80vh">
                <Spinner size="xl" color={COLOR_1} />
            </Center>
        );
    }

    return (
        <Flex minH="85vh" align="center" justify="center" px={4}>
            <Box w={{ base: "full", sm: "md" }} bg={COLOR_4} p={8} rounded="2xl" shadow="2xl">
                <VStack as="form" spacing={6} w="full" onSubmit={handleSubmit}>
                    <Heading size="lg" textAlign="center" color={COLOR_1}>
                        o ante e sitelen
                    </Heading>

                    {error && (
                        <Alert status="error" rounded="md" w="full">
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

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
                        isLoading={saving}
                        isDisabled={!text.trim() || text.length > MAX_CHARS}
                    >
                        o ante
                    </Button>
                </VStack>
            </Box>
        </Flex>
    );
};

export default EditPost;

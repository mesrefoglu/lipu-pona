import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, VStack, Spinner, Alert, AlertIcon, Text } from "@chakra-ui/react";

import { getPostApi } from "../api/endpoints.js";
import Post from "../components/post.js";
import { COLOR_1 } from "../constants/constants.js";

const SinglePost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const data = await getPostApi(id);
                setPost(data);
            } catch (err) {
                console.error(err);
                setError("lipu ni li lon ala anu len. ante la, jan li weka e lipu ni.");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color={COLOR_1} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box maxW="container.sm" mx="auto" py={8}>
                <Alert status="error" rounded="md">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!post) {
        return (
            <Box maxW="container.sm" mx="auto" py={8}>
                <Text color={COLOR_1} textAlign="center">
                    sitelen li lon ala.
                </Text>
            </Box>
        );
    }

    return (
        <Box maxW="container.sm" mx="auto" py={4}>
            <VStack spacing={6}>
                <Post {...post} />
            </VStack>
        </Box>
    );
};

export default SinglePost;

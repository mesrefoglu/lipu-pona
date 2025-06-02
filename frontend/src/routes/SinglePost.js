import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Box, VStack, Spinner, Alert, AlertIcon, Text, Button } from "@chakra-ui/react";

import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { getPostApi, getCommentsApi } from "../api/endpoints.js";
import Post from "../components/Post.js";
import CreateComment from "../components/CreateComment.js";
import Comment from "../components/Comment.js";

const SinglePost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loadingPost, setLoadingPost] = useState(true);
    const [errorPost, setErrorPost] = useState("");

    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentsError, setCommentsError] = useState("");

    const [nextCursor, setNextCursor] = useState(null);

    useEffect(() => {
        setLoadingPost(true);
        setErrorPost("");
        setPost(null);

        getPostApi(id)
            .then((data) => setPost(data))
            .catch(() => {
                setErrorPost("lipu ni li lon ala anu len. ante la, jan li weka e lipu ni.");
            })
            .finally(() => setLoadingPost(false));
    }, [id]);

    const loadComments = useCallback(
        async (cursor) => {
            setLoadingComments(true);
            setCommentsError("");

            try {
                const data = await getCommentsApi(id, cursor);
                setComments((prev) => [...prev, ...data.results]);
                if (data.next) {
                    setNextCursor(data.next);
                } else {
                    setNextCursor(false);
                }
            } catch {
                setCommentsError("pilin ike: toki pi ante li ken ala kama.");
            } finally {
                setLoadingComments(false);
            }
        },
        [id]
    );

    useEffect(() => {
        setComments([]);
        setNextCursor(null);
        setCommentsError("");
        loadComments(null);
    }, [loadComments]);

    const loadMoreComments = () => {
        if (nextCursor && !loadingComments) {
            loadComments(nextCursor);
        }
    };

    if (loadingPost) {
        return (
            <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color={COLOR_1} />
            </Box>
        );
    }

    if (errorPost) {
        return (
            <Box maxW="container.sm" mx="auto" py={8}>
                <Alert status="error" rounded="md">
                    <AlertIcon />
                    {errorPost}
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
            <VStack spacing={2} align="stretch">
                <Post {...post} />

                <Box mt={4} mb={6}>
                    <CreateComment
                        onPostCreated={(newComment) => {
                            setComments((prev) => [newComment, ...prev]);
                        }}
                    />
                </Box>

                <VStack spacing={6} w="full" align="stretch">
                    {comments.map((comment) => (
                        <Comment
                            key={comment.id}
                            {...comment}
                            onDelete={(deletedId) => {
                                setComments((prev) => prev.filter((c) => c.id !== deletedId));
                            }}
                        />
                    ))}

                    {commentsError && (
                        <Alert status="error" rounded="md">
                            <AlertIcon />
                            {commentsError}
                        </Alert>
                    )}

                    {nextCursor && (
                        <Button
                            onClick={loadMoreComments}
                            isLoading={loadingComments}
                            bg={COLOR_3}
                            color={COLOR_4}
                            _hover={{ bg: "teal" }}
                            alignSelf="center"
                        >
                            o kama sin
                        </Button>
                    )}
                </VStack>
            </VStack>
        </Box>
    );
};

export default SinglePost;

import { useState, useEffect } from "react";
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
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            setLoadingPost(true);
            try {
                const data = await getPostApi(id);
                setPost(data);
            } catch (err) {
                setErrorPost("lipu ni li lon ala anu len. ante la, jan li weka e lipu ni.");
            } finally {
                setLoadingPost(false);
            }
        };
        fetchPost();
    }, [id]);

    useEffect(() => {
        const fetchComments = async () => {
            setLoadingComments(true);
            setCommentsError("");
            try {
                const data = await getCommentsApi(id, page);
                setComments((prev) => [...prev, ...data.results]);
                setHasMore(data.has_next);
            } catch (err) {
                setCommentsError("pilin ike: toki pi ante li ken ala kama.");
            } finally {
                setLoadingComments(false);
            }
        };

        fetchComments();
    }, [id, page]);

    const handleCommentCreated = (newComment) => {
        setComments((prev) => [newComment, ...prev]);
    };

    const handleCommentDeleted = (deletedId) => {
        setComments((prev) => prev.filter((c) => c.id !== deletedId));
    };

    const loadMoreComments = () => {
        if (hasMore && !loadingComments) {
            setPage((prev) => prev + 1);
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
                    <CreateComment onPostCreated={handleCommentCreated} />
                </Box>

                <VStack spacing={6} w="full" align="stretch">
                    {comments.map((comment) => (
                        <Comment key={comment.id} {...comment} onDelete={handleCommentDeleted} />
                    ))}

                    {hasMore && (
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

                    {commentsError && (
                        <Alert status="error" rounded="md">
                            <AlertIcon />
                            {commentsError}
                        </Alert>
                    )}
                </VStack>
            </VStack>
        </Box>
    );
};

export default SinglePost;

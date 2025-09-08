import { useState, useEffect, useRef, useCallback } from "react";
import { Box, VStack, Spinner, Text, Flex } from "@chakra-ui/react";

import { getLikedPostsApi } from "../api/endpoints.js";
import { useLang } from "../contexts/useLang.js";
import Post from "../components/Post.js";
import { COLOR_4 } from "../constants/constants.js";

const LikedPosts = () => {
    const { t } = useLang();
    const [posts, setPosts] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const loadPosts = useCallback(async (cursor = null) => {
        setLoading(true);
        try {
            const data = await getLikedPostsApi(cursor);
            setPosts((prev) => (cursor ? [...prev, ...data.results] : data.results));
            setNextCursor(data.next ? data.next : false);
        } catch (error) {
            console.error("Error loading liked posts:", error);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handlePostDeleted = (deletedId) => setPosts((prev) => prev.filter((p) => p.id !== deletedId));

    const observer = useRef();
    const lastPostRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && nextCursor) {
                    loadPosts(nextCursor);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, nextCursor, loadPosts]
    );

    return (
        <Box maxW="container.sm" mx="auto" py={6} px={4}>
            <Text fontSize="xl" fontWeight="bold" color={COLOR_4} mb={4}>
                {t("liked_posts_title")}
            </Text>

            {initialLoad && (
                <Flex justify="center" py={10}>
                    <Spinner color={COLOR_4} size="lg" />
                </Flex>
            )}

            {!initialLoad && posts.length === 0 && (
                <Flex justify="center" py={10}>
                    <Text color={COLOR_4} textAlign="center">
                        {t("no_liked_posts")}
                    </Text>
                </Flex>
            )}

            <VStack spacing={8}>
                {posts.map((post, i) =>
                    i === posts.length - 1 ? (
                        <Box ref={lastPostRef} w="full" key={post.id}>
                            <Post {...post} onDelete={handlePostDeleted} />
                        </Box>
                    ) : (
                        <Post key={post.id} {...post} onDelete={handlePostDeleted} />
                    )
                )}
            </VStack>

            {loading && !initialLoad && (
                <Flex justify="center" mt={4}>
                    <Spinner color={COLOR_4} />
                </Flex>
            )}
        </Box>
    );
};

export default LikedPosts;

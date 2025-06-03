import { useState, useEffect, useRef, useCallback } from "react";
import { Box, VStack, Spinner, Button, HStack } from "@chakra-ui/react";

import { feedApi, discoverApi } from "../api/endpoints.js";
import { useLang } from "../contexts/useLang.js";
import CreatePost from "../components/CreatePost.js";
import Post from "../components/Post.js";
import { COLOR_3, COLOR_4 } from "../constants/constants.js";

const Home = () => {
    const { t } = useLang();
    const [tab, setTab] = useState("following");
    const [posts, setPosts] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadPosts = useCallback(
        async (cursor = null) => {
            setLoading(true);
            const fetcher = tab === "following" ? feedApi : discoverApi;
            const data = await fetcher(cursor);
            setPosts((prev) => [...prev, ...data.results]);
            setNextCursor(data.next ? data.next : false);
            setLoading(false);
        },
        [tab]
    );

    useEffect(() => {
        setPosts([]);
        setNextCursor(null);
        loadPosts(null);
    }, [loadPosts, tab]);

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
        <Box maxW="container.sm" mx="auto" p={2}>
            <HStack spacing={4} justify="center" mb={4}>
                <Button
                    variant={tab === "following" ? "solid" : "ghost"}
                    bg={tab === "following" ? COLOR_3 : "transparent"}
                    color={tab === "following" ? COLOR_4 : COLOR_3}
                    _hover={{ bg: COLOR_3, color: COLOR_4 }}
                    onClick={() => setTab("following")}
                >
                    {t("following_capitalized")}
                </Button>
                <Button
                    variant={tab === "discover" ? "solid" : "ghost"}
                    bg={tab === "discover" ? COLOR_3 : "transparent"}
                    color={tab === "discover" ? COLOR_4 : COLOR_3}
                    _hover={{ bg: COLOR_3, color: COLOR_4 }}
                    onClick={() => setTab("discover")}
                >
                    {t("discover")}
                </Button>
            </HStack>
            <CreatePost onPostCreated={(newPost) => setPosts((prev) => [newPost, ...prev])} />
            <Box maxW="container.sm" mx="auto" py={4}>
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
                {loading && <Spinner mt={4} />}
            </Box>
        </Box>
    );
};

export default Home;

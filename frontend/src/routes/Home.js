import { useState, useEffect, useRef, useCallback } from "react";
import { Box, VStack, Spinner } from "@chakra-ui/react";
import { feedApi } from "../api/endpoints.js";
import CreatePost from "../components/CreatePost.js";
import Post from "../components/Post.js";

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadPosts = useCallback(async (cursor = null) => {
        setLoading(true);
        const data = await feedApi(cursor);
        setPosts((prev) => [...prev, ...data.results]);
        setNextCursor(data.next ? data.next : false);
        setLoading(false);
    }, []);

    useEffect(() => {
        setPosts([]);
        setNextCursor(null);
        loadPosts(null);
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
        <Box maxW="container.sm" mx="auto" p={2}>
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

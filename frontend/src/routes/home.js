import { useState, useEffect, useRef, useCallback } from "react";
import { Box, VStack, Spinner } from "@chakra-ui/react";

import { feedApi } from "../api/endpoints.js";
import Post from "../components/post.js";

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    const lastPostRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) setPage((p) => p + 1);
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const data = await feedApi(page);
                setPosts((prev) => [...prev, ...data.results]);
                setHasMore(data.has_next);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [page]);

    return (
        <Box maxW="container.sm" mx="auto" py={4}>
            <VStack spacing={6}>
                {posts.map((post, i) =>
                    i === posts.length - 1 ? (
                        <Box ref={lastPostRef} w="full" key={post.id}>
                            <Post {...post} />
                        </Box>
                    ) : (
                        <Post key={post.id} {...post} />
                    )
                )}
            </VStack>
            {loading && <Spinner mt={4} />}
        </Box>
    );
};

export default Home;

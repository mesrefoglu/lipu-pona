import { useState, useEffect, useRef, useCallback } from "react";
import {
    Box,
    VStack,
    HStack,
    Text,
    Avatar,
    Button,
    Spinner,
    Flex,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { FiCheck, FiX } from "react-icons/fi";

import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { getFollowRequestsApi, respondFollowRequestApi } from "../api/endpoints.js";
import { useLang } from "../contexts/useLang.js";

const FollowRequests = () => {
    const { t } = useLang();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [processingIds, setProcessingIds] = useState(new Set());

    const loadRequests = useCallback(async (cursor = null) => {
        const isLoadingMore = cursor !== null;
        if (isLoadingMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const data = await getFollowRequestsApi(cursor);
            setRequests((prev) => (cursor ? [...prev, ...data.results] : data.results));
            setNextCursor(data.next || null);
        } catch (error) {
            console.error("Error loading follow requests:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleResponse = async (requestId, action) => {
        setProcessingIds((prev) => new Set(prev).add(requestId));
        try {
            await respondFollowRequestApi(action, requestId);
            setRequests((prev) => prev.filter((req) => req.id !== requestId));
        } catch (error) {
            console.error("Error responding to follow request:", error);
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    const observer = useRef();
    const lastRequestRef = useCallback(
        (node) => {
            if (loadingMore) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && nextCursor) {
                    loadRequests(nextCursor);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loadingMore, nextCursor, loadRequests]
    );

    if (loading) {
        return (
            <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color={COLOR_1} />
            </Box>
        );
    }

    if (requests.length === 0) {
        return (
            <Box maxW="container.sm" mx="auto" py={8} px={4}>
                <Text fontSize="xl" fontWeight="bold" color={COLOR_4} mb={6}>
                    {t("follow_requests")}
                </Text>
                <Alert status="info" rounded="md">
                    <AlertIcon />
                    {t("no_follow_requests")}
                </Alert>
            </Box>
        );
    }

    return (
        <Box maxW="container.sm" mx="auto" py={6} px={4}>
            <Text fontSize="xl" fontWeight="bold" color={COLOR_4} mb={6}>
                {t("follow_requests")}
            </Text>

            <VStack spacing={4} align="stretch">
                {requests.map((request, index) => {
                    const isProcessing = processingIds.has(request.id);
                    const isLast = index === requests.length - 1;

                    return (
                        <Box
                            key={request.id}
                            ref={isLast ? lastRequestRef : null}
                            bg="rgba(0, 0, 0, 0.6)"
                            p={4}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.700"
                        >
                            <HStack justify="space-between" align="center">
                                <HStack spacing={3} flex={1}>
                                    <Avatar
                                        size="sm"
                                        src={request.requester.profile_picture || undefined}
                                        name={request.requester.first_name}
                                    />
                                    <VStack align="flex-start" spacing={0} flex={1}>
                                        <Text
                                            fontWeight="medium"
                                            color={COLOR_4}
                                            fontSize="sm"
                                        >
                                            {request.requester.first_name}
                                        </Text>
                                        <Text
                                            color="gray.400"
                                            fontSize="xs"
                                        >
                                            @{request.requester.username}
                                        </Text>
                                    </VStack>
                                </HStack>

                                <HStack spacing={2}>
                                    <Button
                                        size="sm"
                                        bg={COLOR_3}
                                        color={COLOR_4}
                                        _hover={{ bg: "teal.600" }}
                                        leftIcon={<FiCheck />}
                                        isLoading={isProcessing}
                                        onClick={() => handleResponse(request.id, "accept")}
                                    >
                                        {t("accept")}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        color="gray.400"
                                        _hover={{ bg: "gray.700", color: COLOR_4 }}
                                        leftIcon={<FiX />}
                                        isLoading={isProcessing}
                                        onClick={() => handleResponse(request.id, "reject")}
                                    >
                                        {t("reject")}
                                    </Button>
                                </HStack>
                            </HStack>
                        </Box>
                    );
                })}
            </VStack>

            {loadingMore && (
                <Flex justify="center" mt={6}>
                    <Spinner color={COLOR_4} />
                </Flex>
            )}
        </Box>
    );
};

export default FollowRequests;

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, VStack, HStack, Avatar, Text, Spinner, Button, Flex, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { getNotificationsApi, markNotificationsReadApi } from "../api/endpoints.js";
import { useLang } from "../contexts/useLang.js";

const messageFor = (n, t) => {
    switch (n.verb) {
        case "follow":
            return t("notification_follow");
        case "like":
            return t("notification_like");
        case "comment":
            return t("notification_comment");
        case "mention_post":
            return t("notification_mention_post");
        case "mention_comment":
            return t("notification_mention_comment");
        case "fr_accepted":
            return t("notification_fr_accepted");
        default:
            return n.verb;
    }
};

const Notifications = () => {
    const { t } = useLang();
    const toast = useToast();
    const navigate = useNavigate();

    const [notifs, setNotifs] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const loadNotifs = useCallback(
        async (cursor = null) => {
            setLoading(true);
            try {
                const data = await getNotificationsApi(cursor);
                setNotifs((prev) => [...prev, ...data.results]);
                setNextCursor(data.next ? data.next : false);
            } catch {
                toast({
                    description: t("notification_load_error"),
                    status: "error",
                    position: "top",
                    duration: 4000,
                });
            } finally {
                setLoading(false);
                setInitialLoad(false);
            }
        },
        [toast, t]
    );

    useEffect(() => {
        loadNotifs();
    }, [loadNotifs]);

    const observer = useRef();
    const lastRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && nextCursor) {
                    loadNotifs(nextCursor);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, nextCursor, loadNotifs]
    );

    const handleMarkRead = async () => {
        await markNotificationsReadApi("all");
    };

    const go = (n) => {
        if (n.verb === "follow" || n.verb === "fr_accepted") {
            navigate(`/${n.actor.username}`);
        } else {
            navigate(`/post/${n.target_post_id}`);
        }
    };

    return (
        <Box maxW="container.sm" mx="auto" py={6} px={2}>
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="xl" fontWeight="bold" color={COLOR_4}>
                    {t("notification_title")}
                </Text>
                <Button size="sm" bg={COLOR_3} color={COLOR_4} _hover={{ bg: "teal" }} onClick={handleMarkRead}>
                    {t("notification_mark_read")}
                </Button>
            </Flex>

            <VStack spacing={2} align="stretch">
                {notifs.map((n, i) => (
                    <HStack
                        key={n.id}
                        ref={i === notifs.length - 1 ? lastRef : null}
                        px={3}
                        py={2}
                        borderRadius="md"
                        _hover={{ bg: COLOR_3 }}
                        cursor="pointer"
                        onClick={() => go(n)}
                    >
                        <Avatar size="sm" src={n.actor.profile_picture || undefined} />
                        <VStack align="flex-start" spacing={0} flex={1}>
                            <Text fontWeight="medium" fontSize="sm" color={COLOR_4} isTruncated maxW="250px">
                                {n.actor.first_name || n.actor.username}
                            </Text>
                            <Text fontSize="xs" color={COLOR_4} isTruncated maxW="250px">
                                {messageFor(n, t)}
                            </Text>
                        </VStack>
                        <Text fontSize="xs" color={COLOR_4} whiteSpace="nowrap">
                            {new Date(n.created_at).toLocaleString()}
                        </Text>
                    </HStack>
                ))}

                {initialLoad && (
                    <Flex justify="center" py={10}>
                        <Spinner color={COLOR_1} size="lg" />
                    </Flex>
                )}
                {loading && !initialLoad && <Spinner alignSelf="center" />}
            </VStack>
        </Box>
    );
};

export default Notifications;

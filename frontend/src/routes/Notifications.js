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
        case "follow_request":
            return t("notification_follow_request");
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
                setNotifs((prev) => (cursor ? [...prev, ...data.results] : data.results));
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
        try {
            await markNotificationsReadApi("all");
            setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
            window.dispatchEvent(new Event("refresh-notifs"));
        } catch {
            console.error("Failed to mark notifications as read");
            return;
        }
    };

    const go = async (n) => {
        try {
            await markNotificationsReadApi(n.id);
        } catch (err) {
            console.error("Error marking notifications as read:", err);
            return;
        }
        window.dispatchEvent(new Event("refresh-notifs"));
        if (n.verb === "follow_request") {
            navigate("/account/follow-requests");
        } else if (n.verb === "follow" || n.verb === "fr_accepted") {
            navigate(`/${n.actor.username}`);
        } else {
            navigate(`/post/${n.target_post_id}`);
        }
    };

    return (
        <Box maxW="container.sm" mx="auto" py={6} px={4}>
            <Flex justify="space-between" mb={4}>
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
                        position="relative"
                        px={2}
                        py={1}
                        ml={!n.read ? 8 : 0}
                        borderRadius="md"
                        _hover={{ bg: COLOR_3 }}
                        cursor="pointer"
                        onClick={() => go(n)}
                    >
                        {!n.read && (
                            <Box
                                position="absolute"
                                left="-25px"
                                top="50%"
                                transform="translateY(-50%)"
                                w={2}
                                h={2}
                                bg={COLOR_3}
                                borderRadius="full"
                            />
                        )}
                        <Avatar size="sm" src={n.actor.profile_picture || undefined} />
                        <VStack align="left" spacing={0} flex={1}>
                            <Text fontWeight="medium" fontSize="sm" color={COLOR_4} isTruncated maxW="250px">
                                {n.actor.first_name || n.actor.username}
                            </Text>
                            <Text fontSize="xs" color={COLOR_4} isTruncated maxW="250px">
                                {messageFor(n, t)}
                            </Text>
                        </VStack>
                        <Text fontSize="xs" color={COLOR_4} whiteSpace="nowrap">
                            {new Date(n.created_at)
                                .toLocaleString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                    hourCycle: "h23",
                                })
                                .replace(",", "")}
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

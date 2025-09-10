import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, VStack, HStack, Avatar, Text, Flex, Spacer, useOutsideClick } from "@chakra-ui/react";

import { useLang } from "../contexts/useLang.js";
import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { markNotificationsReadApi } from "../api/endpoints.js";

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

const NotifPanel = ({ notifications, onClose, onMarkRead }) => {
    const ref = useRef();
    const navigate = useNavigate();
    const { t } = useLang();

    useOutsideClick({ ref, handler: onClose });

    const go = async (n) => {
        try {
            await markNotificationsReadApi(n.id);
            onMarkRead();
        } catch (err) {
            console.error("Error marking notifications as read:", err);
            return;
        }
        onClose();
        if (n.verb === "follow_request") {
            navigate("/account/follow-requests");
        } else if (n.verb === "follow" || n.verb === "fr_accepted") {
            navigate(`/${n.actor.username}`);
        } else {
            navigate(`/post/${n.target_post_id}`);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markNotificationsReadApi();
            onMarkRead();
        } catch (err) {
            console.error("Error marking notifications as read:", err);
        }
    };

    return (
        <Box ref={ref} bg={COLOR_3} w="260px" borderBottomRadius="md" overflow="hidden">
            <VStack align="stretch" spacing={0}>
                {notifications.map((n) => (
                    <HStack key={n.id} px={2} py={1} _hover={{ bg: COLOR_4 }} cursor="pointer" onClick={() => go(n)}>
                        <Avatar size="sm" src={n.actor.profile_picture || undefined} />
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="semibold" fontSize="xs" color={COLOR_1} maxW="180px" isTruncated>
                                {n.actor.first_name} @{n.actor.username}
                            </Text>
                            <Text fontSize="xs" color={COLOR_1} maxW="180px" isTruncated>
                                {messageFor(n, t)}
                            </Text>
                        </VStack>
                    </HStack>
                ))}
            </VStack>
            <Flex px={2} py={2} bg={COLOR_3}>
                <Text
                    color={COLOR_1}
                    fontSize="xs"
                    cursor="pointer"
                    _hover={{ color: COLOR_4 }}
                    onClick={markAllAsRead}
                    pl={2}
                >
                    {t("notification_mark_read")}
                </Text>
                <Spacer />
                <Text
                    color={COLOR_1}
                    fontSize="xs"
                    cursor="pointer"
                    _hover={{ color: COLOR_4 }}
                    onClick={() => navigate(`/account/notifications`)}
                    pr={2}
                >
                    {t("notification_see_all")}
                </Text>
            </Flex>
        </Box>
    );
};

export default NotifPanel;

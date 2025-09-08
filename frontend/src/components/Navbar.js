import { useCallback, useEffect, useState } from "react";
import { Flex, HStack, Text, useBreakpointValue } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { FiBell, FiGlobe, FiHelpCircle, FiSearch, FiHeart } from "react-icons/fi";

import { COLOR_1, COLOR_3 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";
import { useLang } from "../contexts/useLang.js";
import UserSearch from "./UserSearch.js";
import NotifPanel from "./NotifPanel.js";
import { getLastNotificationsApi } from "../api/endpoints.js";

const MotionBox = motion.div;

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { lang, t, toggle } = useLang();
    const [searchOpen, setSearchOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const paddingX = useBreakpointValue({ base: 3, md: 6 });
    const logoFontSize = useBreakpointValue({ base: "xl", md: "2xl" });
    const stackSpace = useBreakpointValue({ base: 2, md: 4 });
    const labelFont = useBreakpointValue({ base: "sm", md: "md" });
    const labelMargin = useBreakpointValue({ base: 1, md: 2 });
    const iconSize = useBreakpointValue({ base: 33, md: 40 });
    const notifDotTop = useBreakpointValue({ base: "6px", md: "2px" });
    const notifDotRight = useBreakpointValue({ base: "52px", md: "80px" });
    const notifDotSize = useBreakpointValue({ base: "2xs", md: "xs" });

    const fetchLastNotifications = useCallback(async () => {
        try {
            const data = await getLastNotificationsApi();
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch (err) {
            console.error("Error fetching notifications: ", err);
        }
    }, []);

    const onNotifClick = () => {
        fetchLastNotifications();
        setNotifOpen((v) => !v);
    };

    useEffect(() => {
        if (user) {
            fetchLastNotifications();
        }
        const handler = () => fetchLastNotifications();
        window.addEventListener("refresh-notifs", handler);
        return () => window.removeEventListener("refresh-notifs", handler);
    }, [user, fetchLastNotifications]);

    return (
        <Flex
            w="100%"
            h="50px"
            bg={COLOR_3}
            justify="space-between"
            align="center"
            px={paddingX}
            position="relative"
            overflow="visible"
        >
            <Text
                fontSize={logoFontSize}
                fontWeight="bold"
                color={COLOR_1}
                whiteSpace="nowrap"
                cursor="pointer"
                onClick={() => navigate("/")}
            >
                lipu pona
            </Text>

            <HStack spacing={stackSpace} align="center">
                <AnimatePresence>
                    {searchOpen && (
                        <MotionBox
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ type: "spring", stiffness: 260, damping: 26 }}
                            style={{
                                position: "absolute",
                                top: "100%",
                                right: 20,
                                width: 260,
                                overflow: "hidden",
                                zIndex: 1000,
                            }}
                        >
                            <UserSearch onClose={() => setSearchOpen(false)} />
                        </MotionBox>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {notifOpen && (
                        <MotionBox
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ type: "spring", stiffness: 260, damping: 26 }}
                            style={{
                                position: "absolute",
                                top: "100%",
                                right: 20,
                                width: 260,
                                overflow: "hidden",
                                zIndex: 1000,
                            }}
                        >
                            <NotifPanel
                                notifications={notifications}
                                onClose={() => setNotifOpen(false)}
                                onMarkRead={() => fetchLastNotifications()}
                            />
                        </MotionBox>
                    )}
                </AnimatePresence>
                <HStack spacing={labelMargin} cursor="pointer" onClick={toggle}>
                    <Text color={COLOR_1} fontSize={labelFont} fontWeight="bold" align="right" lineHeight="15px">
                        {lang === "tp" ? t("lang_tp") : lang === "sp" ? t("lang_sp") : t("lang_en")}
                    </Text>
                    <FiGlobe size={iconSize} />
                </HStack>
                <FiHelpCircle size={iconSize} onClick={() => navigate("/site/info")} cursor="pointer" />
                {user && <FiSearch size={iconSize} onClick={() => setSearchOpen((v) => !v)} cursor="pointer" />}
                {user && <FiHeart size={iconSize} onClick={() => navigate("/account/liked")} cursor="pointer" />}
                {user && <FiBell size={iconSize} onClick={onNotifClick} cursor="pointer" />}
                {user && unreadCount > 0 && (
                    <Text
                        position="absolute"
                        top={notifDotTop}
                        right={notifDotRight}
                        bg="red.500"
                        color="white"
                        borderRadius="full"
                        px={1}
                        fontSize={notifDotSize}
                        onClick={() => setNotifOpen((v) => !v)}
                        cursor="pointer"
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                )}
                {user && <CgProfile size={iconSize} onClick={() => navigate(`/${user.username}`)} cursor="pointer" />}
            </HStack>
        </Flex>
    );
};

export default Navbar;

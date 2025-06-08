import { useState } from "react";
import { Flex, HStack, Text, useBreakpointValue } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { FiGlobe, FiHelpCircle, FiSearch } from "react-icons/fi";

import { COLOR_1, COLOR_3 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";
import { useLang } from "../contexts/useLang.js";
import UserSearch from "./UserSearch.js";

const MotionBox = motion.div;

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { lang, t, toggle } = useLang();
    const [open, setOpen] = useState(false);

    const navHeight = useBreakpointValue({ base: "40px", md: "50px" });
    const paddingX = useBreakpointValue({ base: 3, md: 6 });
    const logoFontSize = useBreakpointValue({ base: "xl", md: "2xl" });
    const stackSpace = useBreakpointValue({ base: 2, md: 4 });
    const labelFont = useBreakpointValue({ base: "sm", md: "md" });
    const labelMargin = useBreakpointValue({ base: 1, md: 2 });
    const iconSize = useBreakpointValue({ base: 30, md: 40 });

    const goHome = () => navigate("/");
    const goProfile = () => (user?.username ? navigate(`/${user.username}`) : navigate("/account/login"));

    return (
        <Flex
            w="100%"
            h={navHeight}
            bg={COLOR_3}
            justify="space-between"
            align="center"
            px={paddingX}
            position="relative"
            overflow="visible"
        >
            <Text fontSize={logoFontSize} fontWeight="bold" color={COLOR_1} onClick={goHome} cursor="pointer">
                lipu pona
            </Text>

            <HStack spacing={stackSpace} align="center">
                <AnimatePresence>
                    {open && (
                        <MotionBox
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ type: "spring", stiffness: 260, damping: 26 }}
                            style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                width: 260,
                                overflow: "hidden",
                                zIndex: 1000,
                            }}
                        >
                            <UserSearch onClose={() => setOpen(false)} />
                        </MotionBox>
                    )}
                </AnimatePresence>
                <HStack spacing={labelMargin} cursor="pointer" onClick={toggle}>
                    <Text color={COLOR_1} fontSize={labelFont} fontWeight="bold">
                        {lang === "tp" ? t("lang_tp") : t("lang_en")}
                    </Text>
                    <FiGlobe size={iconSize} />
                </HStack>
                <FiHelpCircle size={iconSize} onClick={() => navigate("/site/info")} cursor="pointer" />
                <FiSearch size={iconSize} onClick={() => setOpen((v) => !v)} cursor="pointer" />
                <CgProfile size={iconSize} onClick={goProfile} cursor="pointer" />
            </HStack>
        </Flex>
    );
};

export default Navbar;

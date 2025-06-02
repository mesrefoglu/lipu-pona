import { useState } from "react";
import { Flex, HStack, Text } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { FiSearch } from "react-icons/fi";

import { COLOR_1, COLOR_3 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";
import UserSearch from "./UserSearch.js";

const MotionBox = motion.div;

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    const goHome = () => navigate("/");
    const goProfile = () => (user?.username ? navigate(`/${user.username}`) : navigate("/account/login"));

    return (
        <Flex
            w="100vw"
            h="50px"
            bg={COLOR_3}
            justifyContent="space-between"
            alignItems="center"
            px={6}
            position="relative"
            overflow="visible"
        >
            <Text fontSize="2xl" fontWeight="bold" color={COLOR_1} onClick={goHome} cursor="pointer">
                lipu pona
            </Text>

            <HStack spacing={4} alignItems="center">
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

                <FiSearch size="40px" onClick={() => setOpen((v) => !v)} cursor="pointer" />
                <CgProfile size="40px" onClick={goProfile} cursor="pointer" />
            </HStack>
        </Flex>
    );
};

export default Navbar;

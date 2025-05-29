import { Text, Flex, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";

import { COLOR_1, COLOR_3 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const goHome = () => navigate("/");
    const goProfile = () => {
        if (user?.username) {
            navigate(`/${user.username}`);
        } else {
            navigate("/account/login");
        }
    };

    return (
        <Flex w="100vw" minH="50px" maxH="8vh" bg={COLOR_3} justifyContent="space-between" alignItems="center" px={6}>
            <HStack w="100%" justifyContent="space-between">
                <Text fontSize="2xl" fontWeight="bold" color={COLOR_1} onClick={goHome} cursor="pointer">
                    lipu pona
                </Text>

                <CgProfile size="40px" onClick={goProfile} cursor="pointer" />
            </HStack>
        </Flex>
    );
};

export default Navbar;

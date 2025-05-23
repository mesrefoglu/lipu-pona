import { Text, Flex, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { CgProfile } from "react-icons/cg";
import { COLOR_1, COLOR_3 } from "../constants/constants.js";

const Navbar = () => {
    const navigate = useNavigate();
    const handleNavigate = (route) => {
        navigate(`/${route}`);
    };

    return (
        <Flex w="100vw" minH="50px" maxH="8vh" bg={COLOR_3} justifyContent="space-between" alignItems="center" px={6}>
            <HStack w="100%" justifyContent="space-between">
                <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={COLOR_1}
                    onClick={() => handleNavigate("")}
                    cursor="pointer"
                >
                    lipu kule pona
                </Text>
                <CgProfile size="40px" onClick={() => handleNavigate("admin")} cursor="pointer" />
            </HStack>
        </Flex>
    );
};

export default Navbar;

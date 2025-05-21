import { Box, VStack } from "@chakra-ui/react";
import Navbar from "./navbar";
import { COLOR_1 } from "../constants/constants.js";

const Layout = ({ children }) => {
    return (
        <VStack w="100vw" minH="100vh" bg={COLOR_1}>
            <Navbar />
            <Box w="100%">{children}</Box>
        </VStack>
    );
};

export default Layout;

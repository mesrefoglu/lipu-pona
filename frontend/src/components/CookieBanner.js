import { useState, useEffect } from "react";
import { Box, Text, HStack, Button } from "@chakra-ui/react";
import { COLOR_2, COLOR_3, COLOR_4 } from "../constants/constants.js";

const STORAGE_KEY = "lp_cookie_consent";

const CookieBanner = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const hasConsent = localStorage.getItem(STORAGE_KEY);
        if (!hasConsent) setVisible(true);
    }, []);

    const accept = () => {
        localStorage.setItem(STORAGE_KEY, "accepted");
        setVisible(false);
    };

    const leave = () => {
        window.location.href = "https://www.google.com";
    };

    if (!visible) return null;

    return (
        <Box
            position="fixed"
            bottom={0}
            left={0}
            w="100%"
            bg={COLOR_2}
            color={COLOR_4}
            px={4}
            py={3}
            zIndex={1400}
            boxShadow="0 -2px 6px rgba(0,0,0,0.4)"
        >
            <HStack justify="space-between" align="center" flexWrap="wrap" spacing={4}>
                <Text fontSize="sm">
                    We use essential cookies to keep you logged in and secure. They're required for
                    <strong> lipu pona </strong> to function. More info in our{" "}
                    <a href="/site/legal/cookies" style={{ color: COLOR_4, textDecoration: "underline" }}>
                        Cookie & Tracking Notice
                    </a>
                    .
                </Text>

                <HStack>
                    <Button size="sm" bg={COLOR_3} color={COLOR_4} _hover={{ bg: "teal" }} onClick={accept}>
                        Accept Necessary Cookies
                    </Button>
                    <Button size="sm" variant="ghost" color={COLOR_4} onClick={leave}>
                        Leave site
                    </Button>
                </HStack>
            </HStack>
        </Box>
    );
};

export default CookieBanner;

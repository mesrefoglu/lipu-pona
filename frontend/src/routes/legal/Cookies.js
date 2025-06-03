import { Box, Heading, Text } from "@chakra-ui/react";
import { COLOR_4 } from "../../constants/constants.js";

const Cookies = () => (
    <Box w="100%" maxW="container.xl" mx="auto" py={10} px={4}>
        <Heading size="lg" color={COLOR_4} mb={6}>
            Cookie&nbsp;&amp;&nbsp;Tracking&nbsp;Notice
        </Heading>

        <Text color={COLOR_4} whiteSpace="pre-wrap" fontSize="sm">
            <Text as="span" fontWeight="bold">
                ESSENTIAL COOKIES WE SET
            </Text>
            {`
We set two strictly-necessary cookies so you can log in securely and stay authenticated:

• access_token: Used to authenticate your session. Expires after 12 hours.  
• refresh_token: Used to refresh your session. Expires after 30 days.

Both cookies are marked HttpOnly, Secure, and SameSite=Lax. Because they are essential for the Service to function, they cannot be disabled without leaving the Service.

`}
            <Text as="span" fontWeight="bold">
                NO ANALYTICS OR MARKETING COOKIES
            </Text>
            {`
At this time, we do not set any analytics or marketing cookies. We do not collect tracking information for advertising or performance metrics.

`}
            <Text as="span" fontWeight="bold">
                DISABLING ESSENTIAL COOKIES
            </Text>
            {`
If you do not wish to accept these essential cookies, you must stop using the Service. Logging out from your account will clear these cookies.`}
        </Text>
    </Box>
);

export default Cookies;

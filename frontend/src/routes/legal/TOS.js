import { Box, Heading, Text } from "@chakra-ui/react";
import { COLOR_4 } from "../../constants/constants.js";

const TOS = () => (
    <Box w="100%" maxW="container.xl" mx="auto" py={10} px={4}>
        <Heading size="lg" color={COLOR_4} mb={6}>
            Terms&nbsp;of&nbsp;Service
        </Heading>

        <Text color={COLOR_4} whiteSpace="pre-wrap" fontSize="sm">
            <Text as="span" fontWeight="bold">
                INTRODUCTION
            </Text>
            {`
Welcome to lipu pona (operated by Liam Mesrefoglu et al., "we", "us", "our"). By creating an account, browsing, or otherwise using the Service located at https://lipu-pona.com (the "Service"), you ("you", "User") agree to be bound by these Terms of Service ("Terms"). If you do not agree, you must not access the Service.

`}
            <Text as="span" fontWeight="bold">
                1. ELIGIBILITY & ACCOUNT REGISTRATION
            </Text>
            {`
1.1 You must be at least 13 years old—or the age of digital consent in your jurisdiction—to use the Service. Users under 18 affirm that a parent or guardian has reviewed these Terms.
1.2 You are responsible for safeguarding your login credentials and for all activities that occur under your account.

`}
            <Text as="span" fontWeight="bold">
                2. LICENSE TO USE THE SERVICE
            </Text>
            {`
We grant you a personal, non-exclusive, revocable, non-transferable license to access and use the Service for lawful purposes, subject to these Terms.

`}
            <Text as="span" fontWeight="bold">
                3. USER-GENERATED CONTENT ("UGC")
            </Text>
            {`
3.1 Your Content. You retain ownership of content you post, including text and images. By posting UGC you grant us a worldwide, non-exclusive, royalty-free license to host, store, reproduce, modify (e.g. resize images), publicly display, and distribute your UGC solely for the operation, promotion, and improvement of the Service.
3.2 Responsibility. You are solely responsible for your UGC and for ensuring it does not violate any law or these Terms.
3.3 Community Guidelines. You agree not to post content that is unlawful, harassing, hateful, sexually explicit, or that infringes intellectual-property rights. We reserve the right—but have no obligation—to remove UGC and/or suspend accounts at our sole discretion.

`}
            <Text as="span" fontWeight="bold">
                4. PROHIBITED CONDUCT
            </Text>
            {`
You agree not to: (a) scrape the Service; (b) use automated scripts except via our documented API; (c) interfere with servers or networks; (d) impersonate others; (e) upload viruses or malware.

`}
            <Text as="span" fontWeight="bold">
                5. INTELLECTUAL-PROPERTY RIGHTS
            </Text>
            {`
All code, design, and trademarks of the Service are owned by lipu pona or our licensors. No rights are granted except as explicitly stated.

`}
            <Text as="span" fontWeight="bold">
                6. PRIVACY & COOKIES
            </Text>
            {`
Your use is subject to our Privacy Policy and Cookie Notice, which explain how we process personal data and set strictly-necessary cookies (access_token, refresh_token).

`}
            <Text as="span" fontWeight="bold">
                7. THIRD-PARTY LINKS & SERVICES
            </Text>
            {`
The Service may contain links to third-party content. We do not endorse or assume responsibility for third-party sites or services.

`}
            <Text as="span" fontWeight="bold">
                8. TERMINATION
            </Text>
            {`
We may suspend or terminate your account at any time for breach of these Terms or to comply with legal obligations. Upon termination, license grants survive only as necessary for us to operate archival copies or as required by law.

`}
            <Text as="span" fontWeight="bold">
                9. DISCLAIMER OF WARRANTIES
            </Text>
            {`
The Service is provided "AS IS" and "AS AVAILABLE". We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.

`}
            <Text as="span" fontWeight="bold">
                10. LIMITATION OF LIABILITY
            </Text>
            {`
To the maximum extent permitted by law, in no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data, whether incurred directly or indirectly. Our aggregate liability shall not exceed CAD 100 or the amount you paid us in the past 12 months, whichever is greater.

`}
            <Text as="span" fontWeight="bold">
                11. INDEMNITY
            </Text>
            {`
You agree to indemnify and hold harmless lipu pona and its officers, directors, and employees from any claims arising out of your UGC or breach of these Terms.

`}
            <Text as="span" fontWeight="bold">
                12. GOVERNING LAW & VENUE
            </Text>
            {`
These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles. All disputes shall be resolved in the courts located in Toronto, Ontario.

`}
            <Text as="span" fontWeight="bold">
                13. CHANGES TO THE TERMS
            </Text>
            {`
We may modify these Terms by posting the updated version on the Service and providing 30 days’ notice via email or in-app banner. Continued use after the effective date constitutes acceptance.

`}
            <Text as="span" fontWeight="bold">
                14. CONTACT
            </Text>
            {`
Questions? Email us at contact@qedized.com.
`}
        </Text>
    </Box>
);

export default TOS;

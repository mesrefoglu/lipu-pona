import { Box, Heading, Text } from "@chakra-ui/react";
import { COLOR_4 } from "../../constants/constants.js";

const PrivacyPolicy = () => (
    <Box w="100%" maxW="container.md" mx="auto" py={10} px={4}>
        <Heading size="lg" color={COLOR_4} mb={6}>
            Privacy&nbsp;Policy
        </Heading>

        <Text color={COLOR_4} whiteSpace="pre-wrap" fontSize="sm">
            <Text as="span" fontWeight="bold">
                INTRODUCTION
            </Text>
            {`
Welcome to lipu pona (operated by Liam Mesrefoglu et al., "we", "us", "our"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and share your information when you use https://lipu-pona.com (the “Service”). By accessing or using the Service, you agree to this Privacy Policy.

`}
            <Text as="span" fontWeight="bold">
                1. INFORMATION WE COLLECT
            </Text>
            {`
1.1 Account Information. When you register, we collect your username, email address, and password. We store a hashed version of your password for authentication.
1.2 Profile Data. You may optionally provide a profile picture and a short biography.
1.3 Usage Data. We collect data about your interactions with the Service, including posts you create, comments, likes, and the date and time of your activities.
1.4 Cookies. We set two strictly-necessary cookies (access_token, refresh_token) so you can log in securely and stay authenticated. They are HttpOnly, Secure, SameSite=Lax, and expire after 12 h and 30 days respectively. These cookies cannot be disabled without leaving the Service.
1.5 Server Logs. Our servers automatically record your IP address, browser type, operating system, and the pages you visit to help diagnose issues and improve the Service.

`}
            <Text as="span" fontWeight="bold">
                2. HOW WE USE YOUR INFORMATION
            </Text>
            {`
2.1 To Provide the Service. We use your account information to authenticate you and allow you to upload, edit, and delete posts and comments.
2.2 Communication. We send transactional emails (e.g., account activation, password reset) to the email address you provide.
2.3 Improvement. Usage data helps us improve performance and user experience. We analyze anonymized data to identify trends and usage patterns.
2.4 Legal Compliance. We may use and retain your data to comply with applicable laws, resolve disputes, and enforce our agreements.

`}
            <Text as="span" fontWeight="bold">
                3. HOW WE SHARE YOUR INFORMATION
            </Text>
            {`
3.1 Service Providers. We may share data with third-party vendors who perform services on our behalf (hosting, email delivery, analytics). All providers maintain a comparable level of data protection.
3.2 Legal Requests. We may disclose your information if required by law or to protect our rights, property, or safety, or that of others.
3.3 Business Transfers. If lipu pona is acquired or merged, your data may be transferred to the new owner, subject to this Privacy Policy.

`}
            <Text as="span" fontWeight="bold">
                4. YOUR RIGHTS
            </Text>
            {`
4.1 Access and Correction. You can access and update your profile information at any time via your account settings.
4.2 Data Portability. Upon request to contact@qedized.com, we will provide a copy of your data in a commonly used format (JSON).
4.3 Deletion. You may delete your account by contacting us at contact@qedized.com, or by using the delete account feature in your profile settings. This will remove your personal data from our active database.
4.4 Opt-Out. Since we only use strictly-necessary cookies, there are no tracking cookies to opt out of. If you wish to stop using the Service, you may delete your account.

`}
            <Text as="span" fontWeight="bold">
                5. DATA RETENTION
            </Text>
            {`
We retain your personal data only as long as necessary to provide the Service and comply with legal obligations. When you delete your account, we erase your data from our active database, but may retain archived copies for up to 12 months for compliance or legal reasons.

`}
            <Text as="span" fontWeight="bold">
                6. SECURITY
            </Text>
            {`
We employ industry-standard security measures, including SSL/TLS encryption, to protect data in transit. Passwords are hashed using Django’s secure algorithm. While no system is impenetrable, we strive to maintain the confidentiality of your information. In the event of a data breach, we will notify affected users and authorities within 72 hours.

`}
            <Text as="span" fontWeight="bold">
                7. INTERNATIONAL TRANSFERS
            </Text>
            {`
Our servers are hosted in Canada. If you access the Service from outside Canada, your data may be transferred to and processed in Canada. We rely on PIPEDA’s principle that foreign jurisdictions provide comparable data protection.

`}
            <Text as="span" fontWeight="bold">
                8. THIRD-PARTY ANALYTICS
            </Text>
            {`
Currently, we do not use any analytics or marketing cookies. If we add analytics in the future, we will update this policy and obtain your explicit consent.

`}
            <Text as="span" fontWeight="bold">
                9. CHILDREN
            </Text>
            {`
The Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such data, we will promptly delete it.

`}
            <Text as="span" fontWeight="bold">
                10. CHANGES TO THIS POLICY
            </Text>
            {`
We may update this Privacy Policy from time to time. If we make material changes, we will notify you via email (if provided) or by posting a notice on the Service. Your continued use after changes indicates your acceptance.

`}
            <Text as="span" fontWeight="bold">
                11. CONTACT
            </Text>
            {`
If you have questions about this Privacy Policy, please email us at contact@qedized.com.`}
        </Text>
    </Box>
);

export default PrivacyPolicy;

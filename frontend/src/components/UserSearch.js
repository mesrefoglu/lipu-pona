import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Input, VStack, HStack, Avatar, Text, useOutsideClick } from "@chakra-ui/react";

import { searchUsersApi } from "../api/endpoints.js";
import { useLang } from "../contexts/useLang.js";
import { COLOR_1, COLOR_2, COLOR_3 } from "../constants/constants.js";

const UserSearch = ({ onClose }) => {
    const { t } = useLang();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const ref = useRef();

    useOutsideClick({ ref, handler: onClose });

    useEffect(() => {
        const handler = setTimeout(async () => {
            const data = await searchUsersApi(query.trim());
            setResults(data);
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    const go = (username) => {
        onClose();
        navigate(`/${username}`);
    };

    return (
        <Box ref={ref} bg={COLOR_3} w="260px" position="relative">
            <Input
                placeholder={t("search_users_placeholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                border="none"
                borderRadius="0"
                color={COLOR_1}
                bg={COLOR_3}
                _focus={{ outline: "none", boxShadow: "none", borderColor: "transparent" }}
                _focusVisible={{ outline: "none", boxShadow: "none", borderColor: "transparent" }}
                _placeholder={{ color: COLOR_1 }}
            />

            <Box borderRadius={10}>
                <VStack align="stretch" spacing={0}>
                    {results.map((user) => (
                        <HStack
                            key={user.username}
                            px={2}
                            py={1}
                            _hover={{ bg: COLOR_2 }}
                            cursor="pointer"
                            onClick={() => go(user.username)}
                        >
                            <Avatar size="sm" src={user.profile_picture || undefined} />
                            <VStack align="start" spacing={0}>
                                {!!user.first_name && (
                                    <Text fontWeight="bold" color={COLOR_1} maxW="180px" isTruncated>
                                        {user.first_name}
                                    </Text>
                                )}
                                <Text fontSize="sm" color={COLOR_1}>
                                    @{user.username}
                                </Text>
                            </VStack>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </Box>
    );
};

export default UserSearch;

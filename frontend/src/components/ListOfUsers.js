import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    HStack,
    Avatar,
    Text,
    Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { COLOR_1, COLOR_2, COLOR_4 } from "../constants/constants.js";

const ListOfUsers = ({ isOpen, onClose, users, title, loading }) => {
    const navigate = useNavigate();

    const goProfile = (username) => {
        onClose();
        navigate(`/${username}`);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
            <ModalOverlay />
            <ModalContent bg={COLOR_1}>
                <ModalHeader color={COLOR_4}>{title}</ModalHeader>
                <ModalCloseButton color={COLOR_4} />
                <ModalBody maxH="60vh" overflowY="auto" p={0}>
                    {loading ? (
                        <Spinner m={6} />
                    ) : (
                        <VStack align="stretch" spacing={0}>
                            {users.map((u) => (
                                <HStack
                                    key={u.username}
                                    spacing={1}
                                    px={4}
                                    py={2}
                                    _hover={{ bg: COLOR_2 }}
                                    cursor="pointer"
                                    onClick={() => goProfile(u.username)}
                                >
                                    <Avatar size="md" src={u.profile_picture || undefined} />
                                    <VStack align="start" spacing={0}>
                                        {u.first_name && (
                                            <Text fontWeight="bold" color={COLOR_4} pl={4} maxW="300px" isTruncated>
                                                {u.first_name}
                                            </Text>
                                        )}
                                        <Text fontSize="sm" color={COLOR_4} pl={4} whiteSpace="nowrap">
                                            @{u.username}
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </VStack>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ListOfUsers;

import { useState } from "react";
import {
    Box,
    Flex,
    Avatar,
    Text,
    Image,
    HStack,
    Icon,
    Divider,
    Button,
    Link,
    useToast,
    Spacer,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaEdit, FaTrash } from "react-icons/fa";

import { BASE_URL, COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { likeApi, deletePostApi } from "../api/endpoints.js";
import ConfirmDialog from "./ConfirmDialogue.js";

const ActionButton = ({ icon, label, onClick, active }) => (
    <Button
        variant="ghost"
        p={2}
        onClick={onClick}
        _hover={{ color: COLOR_3 }}
        display="flex"
        alignItems="center"
        color={active ? COLOR_3 : COLOR_4}
        gap={1}
    >
        <Icon as={icon} boxSize={7} />
        {label != null && <Text>{label}</Text>}
    </Button>
);

const Post = ({
    id,
    is_mine,
    username,
    name,
    profile_picture,
    image,
    text,
    formatted_date,
    like_count,
    is_liked,
    comment_count,
    is_edited,
    onDelete,
}) => {
    const navigate = useNavigate();
    const toast = useToast();

    const [liked, setLiked] = useState(is_liked);
    const [likes, setLikes] = useState(like_count);
    const [, setDeleting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleLike = async () => {
        const next = !liked;
        setLiked(next);
        setLikes((c) => c + (next ? 1 : -1));
        try {
            await likeApi(id);
        } catch {
            setLiked(liked);
            setLikes(like_count);
        }
    };

    const handleShare = () => {
        const url = `${BASE_URL}/post/${id}`;
        navigator.clipboard.writeText(url).then(() => {
            toast({
                description: "Nasin tawa li kama sama!",
                status: "success",
                duration: 2000,
            });
        });
    };

    const handleDelete = () => setConfirmOpen(true);
    const onConfirmDelete = async () => {
        setDeleting(true);
        try {
            await deletePostApi(id);
            setConfirmOpen(false);
            toast({ description: "sitelen li pakala!", status: "success", duration: 2000 });
            if (onDelete) {
                onDelete(id);
            } else {
                navigate(`/${username}`);
            }
        } catch {
            toast({ description: "pilin ike: post li ken ala pakala", status: "error", duration: 2000 });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Box w="full" mb={6}>
                <Flex align="center" mb={3}>
                    <Flex onClick={() => navigate(`/${username}`)} cursor="pointer">
                        <Avatar size="md" src={profile_picture || undefined} />
                        <HStack ml={3} spacing={2}>
                            {name && (
                                <Text fontWeight="bold" color={COLOR_4}>
                                    {name}
                                </Text>
                            )}
                            <Text fontSize="sm" color={COLOR_4}>
                                @{username}
                            </Text>
                        </HStack>
                    </Flex>
                </Flex>

                {image && (
                    <Link href={image} isExternal>
                        <Image src={image} alt="post image" w="full" borderRadius="md" mb={3} objectFit="cover" />
                    </Link>
                )}

                {text && (
                    <Text mb={3} whiteSpace="pre-wrap" color={COLOR_4}>
                        {text}
                    </Text>
                )}

                {is_edited && (
                    <Text fontSize="xs" color={COLOR_4} mb={2}>
                        (lipu li ante)
                    </Text>
                )}

                <Divider mb={2} />
                <Text fontSize="xs" color={COLOR_4} mb={2}>
                    {formatted_date}
                </Text>
                <Divider mb={2} />

                <HStack spacing={6}>
                    <ActionButton icon={liked ? FaHeart : FaRegHeart} label={likes} onClick={handleLike} />
                    <ActionButton icon={FaRegComment} label={comment_count} onClick={() => {}} />
                    <ActionButton icon={FaShare} onClick={handleShare} />
                    <Spacer />
                    {is_mine && (
                        <>
                            <ActionButton icon={FaEdit} onClick={() => navigate(`/post/edit/${id}`)} />
                            <ActionButton icon={FaTrash} onClick={handleDelete} active={false} />
                        </>
                    )}
                </HStack>
            </Box>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={onConfirmDelete}
                title="o weka ala weka e pana ni anu?"
                description="sina ken ala e tawa monsi."
                confirmText="o weka"
                cancelText="ala"
                headerTextColor={COLOR_1}
                bodyTextColor={COLOR_1}
                cancelButtonColorScheme="gray"
                confirmButtonColorScheme="red"
            />
        </>
    );
};

export default Post;

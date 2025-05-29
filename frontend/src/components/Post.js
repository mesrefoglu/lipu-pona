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

import { useAuth } from "../contexts/useAuth.js";
import { BASE_URL, COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { likeApi, deletePostApi, getLikersApi } from "../api/endpoints.js";
import ConfirmDialog from "./ConfirmDialogue.js";
import ListOfUsers from "./ListOfUsers.js";

const ActionButton = ({ icon, onClick, active }) => (
    <Button
        variant="ghost"
        p={2}
        onClick={onClick}
        _hover={{ color: COLOR_3 }}
        display="flex"
        alignItems="center"
        color={active ? COLOR_3 : COLOR_4}
    >
        <Icon as={icon} boxSize={7} />
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
    const toast = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [liked, setLiked] = useState(is_liked);
    const [likes, setLikes] = useState(like_count);
    const [, setDeleting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [likersOpen, setLikersOpen] = useState(false);
    const [likersLoading, setLikersLoading] = useState(false);
    const [likers, setLikers] = useState([]);

    const handleLike = async () => {
        const next = !liked;
        setLiked(next);
        setLikes((c) => c + (next ? 1 : -1));

        setLikers((prev) => {
            if (!user) return prev;
            if (next) {
                const others = prev.filter((u) => u.username !== user.username);
                return [user, ...others];
            }
            return prev.filter((u) => u.username !== user.username);
        });

        try {
            await likeApi(id);
        } catch {
            setLiked(!next);
            setLikes((c) => c + (next ? -1 : 1));
            setLikers((prev) => (next ? prev.filter((u) => u.username !== user?.username) : [user, ...prev]));
        }
    };

    const openLikers = async () => {
        setLikersOpen(true);
        setLikersLoading(true);
        try {
            const data = await getLikersApi(id);
            setLikers(data);
        } finally {
            setLikersLoading(false);
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

                {image && (
                    <Link href={image} isExternal>
                        <Image src={image} alt="post image" w="full" borderRadius="md" mb={3} objectFit="cover" />
                    </Link>
                )}

                <Divider mb={2} />
                <Text fontSize="xs" color={COLOR_4} mb={2}>
                    {formatted_date}
                </Text>
                <Divider mb={2} />

                <HStack spacing={0}>
                    <ActionButton icon={liked ? FaHeart : FaRegHeart} onClick={handleLike} />
                    <Text color={COLOR_4} cursor="pointer" onClick={openLikers} pl={2} pr={4}>
                        {likes} ijo olin
                    </Text>

                    <ActionButton icon={FaRegComment} onClick={() => navigate(`/post/${id}`)} />
                    <Text color={COLOR_4} cursor="pointer" onClick={() => navigate(`/post/${id}`)} pl={2} pr={4}>
                        {comment_count} ijo toki
                    </Text>

                    <ActionButton icon={FaShare} onClick={handleShare} />
                    <Spacer />
                    {is_mine && (
                        <>
                            <ActionButton icon={FaEdit} onClick={() => navigate(`/post/edit/${id}`)} />
                            <ActionButton icon={FaTrash} onClick={handleDelete} />
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

            <ListOfUsers
                isOpen={likersOpen}
                onClose={() => setLikersOpen(false)}
                users={likers}
                title="jan olin e pana ni"
                loading={likersLoading}
            />
        </>
    );
};

export default Post;

import { Box, Flex, Avatar, Text, Image, HStack, Icon, Divider, Button, Link } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";
import { likeApi } from "../api/endpoints.js";
import { API_URL, COLOR_3, COLOR_4 } from "../constants/constants.js";

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
        <Text>{label}</Text>
    </Button>
);

const Post = ({
    id,
    username,
    authorName,
    authorPic,
    image,
    text,
    created_at,
    like_count,
    is_liked,
    comment_count,
    formatted_date,
}) => {
    const navigate = useNavigate();

    const [liked, setLiked] = useState(is_liked);
    const [likes, setLikes] = useState(like_count);

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

    const imageSrc = image && (image.startsWith("http") ? image : API_URL + image);

    return (
        <Box w="full" mb={6}>
            <Flex align="center" mb={3}>
                <Flex onClick={() => navigate(`/${username}`)} cursor="pointer">
                    <Avatar size="md" src={authorPic ? API_URL + authorPic : undefined} />
                    <HStack ml={3} spacing={2}>
                        {authorName && (
                            <Text fontWeight="bold" color={COLOR_4}>
                                {authorName}
                            </Text>
                        )}
                        <Text fontSize="sm" color={COLOR_4}>
                            @{username}
                        </Text>
                    </HStack>
                </Flex>
            </Flex>

            {imageSrc && (
                <Link href={imageSrc} isExternal>
                    <Image src={imageSrc} alt="post image" w="full" borderRadius="md" mb={3} objectFit="cover" />
                </Link>
            )}

            {text && (
                <Text mb={3} whiteSpace="pre-wrap" color={COLOR_4}>
                    {text}
                </Text>
            )}

            <Divider mb={2} />

            <Text fontSize="xs" color={COLOR_4} mb={2}>
                {formatted_date || created_at}
            </Text>

            <Divider mb={2} />

            <HStack spacing={6}>
                <ActionButton icon={liked ? FaHeart : FaRegHeart} label={likes} onClick={handleLike} />
                <ActionButton icon={FaRegComment} label={comment_count} />
            </HStack>
        </Box>
    );
};

export default Post;

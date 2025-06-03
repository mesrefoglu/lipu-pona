import { useState, useRef, useEffect } from "react";
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
    Editable,
    EditablePreview,
    EditableTextarea,
    VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaEdit, FaTrash } from "react-icons/fa";
import autosize from "autosize";

import { useAuth } from "../contexts/useAuth.js";
import { useLang } from "../contexts/useLang.js";
import { BASE_URL, COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { likeApi, getLikersApi, editPostApi, deletePostApi } from "../api/endpoints.js";
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

const MAX_CHARS = 1000;

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
    is_edited: originalEdited,
    onDelete,
}) => {
    const toast = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLang();

    const [displayText, setDisplayText] = useState(text);
    const [edited, setEdited] = useState(originalEdited);

    const [liked, setLiked] = useState(is_liked);
    const [likes, setLikes] = useState(like_count);

    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const [saving, setSaving] = useState(false);
    const editRef = useRef(null);

    const [, setDeleting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [likersOpen, setLikersOpen] = useState(false);
    const [likersLoading, setLikersLoading] = useState(false);
    const [likers, setLikers] = useState([]);

    useEffect(() => {
        const editRefElement = editRef.current;
        if (editing && editRefElement) {
            autosize(editRefElement);
            return () => autosize.destroy(editRefElement);
        }
    }, [editing]);

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
                description: t("share_success"),
                status: "success",
                duration: 2000,
            });
        });
    };

    const startEditing = () => {
        setEditText(displayText);
        setEditing(true);
    };

    const saveEdit = async (val) => {
        setEditing(false);
        const newText = (typeof val === "string" ? val : editText).trim();
        if (!newText || newText === displayText) {
            return;
        }
        const lastText = displayText;
        const wasEdited = edited;
        setDisplayText(newText);
        setEdited(true);
        setSaving(true);
        try {
            await editPostApi(id, newText);
            toast({ description: t("edit_success"), status: "success", duration: 2000 });
        } catch {
            toast({ description: t("edit_error"), status: "error", duration: 2000 });
            setEditing(true);
            setDisplayText(lastText);
            setEdited(wasEdited);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => setConfirmOpen(true);
    const onConfirmDelete = async () => {
        setDeleting(true);
        try {
            await deletePostApi(id);
            setConfirmOpen(false);
            toast({ description: t("delete_success"), status: "success", duration: 2000 });
            if (onDelete) onDelete(id);
            else navigate(`/${username}`);
        } catch {
            toast({ description: t("delete_error"), status: "error", duration: 2000 });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Box w="full">
                <Flex align="center" mb={3} w="full">
                    <Flex onClick={() => navigate(`/${username}`)} cursor="pointer" w="auto" align="center">
                        <Avatar size="md" src={profile_picture || undefined} />
                        <VStack align="flex-start" ml={3} flex="1" minW="0">
                            {name && (
                                <Text fontWeight="bold" color={COLOR_4} w="full" isTruncated>
                                    {name}
                                </Text>
                            )}
                            <Text fontSize="sm" color={COLOR_4} whiteSpace="nowrap">
                                @{username}
                            </Text>
                        </VStack>
                    </Flex>
                </Flex>

                <Editable
                    key={editing ? "editing" : "preview"}
                    value={editing ? editText : displayText}
                    isPreviewFocusable={false}
                    selectAllOnFocus={false}
                    startWithEditView={editing}
                    submitOnBlur={false}
                    onCancel={() => setEditing(false)}
                    onSubmit={saveEdit}
                    onChange={(val) => setEditText(val.slice(0, MAX_CHARS))}
                >
                    {({ isEditing, onSubmit }) => (
                        <>
                            {isEditing ? (
                                <>
                                    <Box w="full" position="relative">
                                        <EditableTextarea
                                            ref={editRef}
                                            rows={1}
                                            border="none"
                                            _hover={{ border: "none" }}
                                            _focus={{ boxShadow: "none", border: "none" }}
                                            color={COLOR_4}
                                            whiteSpace="pre-wrap"
                                        />
                                        <Text
                                            fontSize="xs"
                                            color={editText.length === MAX_CHARS ? "red.500" : "orange.500"}
                                            position="absolute"
                                            bottom={2}
                                            right={3}
                                            pointerEvents="none"
                                        >
                                            {editText.length > MAX_CHARS - 100 ? MAX_CHARS - editText.length : ""}
                                        </Text>
                                    </Box>
                                    <Box display="flex" justifyContent="flex-end">
                                        <Button
                                            mb={2}
                                            leftIcon={<FaEdit />}
                                            bg={COLOR_3}
                                            color={COLOR_4}
                                            _hover={{ bg: "teal" }}
                                            isLoading={saving}
                                            isDisabled={!editText.trim() || editText.length > MAX_CHARS}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={onSubmit}
                                        >
                                            {t("edit")}
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <EditablePreview as={Text} mb={3} whiteSpace="pre-wrap" color={COLOR_4} w="full" />
                            )}
                        </>
                    )}
                </Editable>

                {edited && !editing && (
                    <Text fontSize="xs" color={COLOR_4} mb={2}>
                        ({t("post_edited")})
                    </Text>
                )}

                {image && (
                    <Link href={image} isExternal>
                        <Image
                            src={image}
                            alt="post image"
                            w="full"
                            borderRadius="md"
                            mb={3}
                            objectFit="cover"
                            loading="lazy"
                        />
                    </Link>
                )}

                <Divider mb={2} />
                <Text fontSize="xs" color={COLOR_4} mb={2}>
                    {formatted_date}
                </Text>
                <Divider mb={2} />

                <HStack spacing={0}>
                    <ActionButton icon={liked ? FaHeart : FaRegHeart} onClick={handleLike} active={liked} />
                    <Text color={COLOR_4} cursor="pointer" onClick={openLikers} pl={2} pr={4}>
                        {likes} {t("likes")}
                    </Text>

                    <ActionButton icon={FaRegComment} onClick={() => navigate(`/post/${id}`)} />
                    <Text color={COLOR_4} cursor="pointer" onClick={() => navigate(`/post/${id}`)} pl={2} pr={4}>
                        {comment_count} {t("comments")}
                    </Text>

                    <ActionButton icon={FaShare} onClick={handleShare} />
                    <Spacer />
                    {is_mine && (
                        <>
                            {!editing && <ActionButton icon={FaEdit} onClick={startEditing} />}
                            <ActionButton icon={FaTrash} onClick={handleDelete} />
                        </>
                    )}
                </HStack>
            </Box>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={onConfirmDelete}
                title={t("confirm_delete_title_post")}
                description={t("confirm_delete_description")}
                confirmText={t("confirm_delete_confirm")}
                cancelText={t("no")}
                headerTextColor={COLOR_1}
                bodyTextColor={COLOR_1}
                cancelButtonColorScheme="gray"
                confirmButtonColorScheme="red"
            />

            <ListOfUsers
                isOpen={likersOpen}
                onClose={() => setLikersOpen(false)}
                users={likers}
                title={t("likers_title_post")}
                loading={likersLoading}
            />
        </>
    );
};

export default Post;

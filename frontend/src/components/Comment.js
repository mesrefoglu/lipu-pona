import { useState, useRef, useEffect } from "react";
import {
    Box,
    Flex,
    Avatar,
    Text,
    HStack,
    Icon,
    Divider,
    Button,
    useToast,
    Spacer,
    Editable,
    EditablePreview,
    EditableTextarea,
    VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaEdit, FaTrash } from "react-icons/fa";
import autosize from "autosize";

import { useAuth } from "../contexts/useAuth.js";
import { useLang } from "../contexts/useLang.js";
import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { likeCommentApi, getCommentLikersApi, editCommentApi, deleteCommentApi } from "../api/endpoints.js";
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
        <Icon as={icon} boxSize={6} />
    </Button>
);

const MAX_CHARS = 250;

const Comment = ({
    id,
    is_mine,
    username,
    name,
    profile_picture,
    text,
    formatted_date,
    like_count,
    is_liked,
    is_edited,
    onDelete,
}) => {
    const toast = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLang();

    const [displayText, setDisplayText] = useState(text);
    const [edited, setEdited] = useState(is_edited);

    const [liked, setLiked] = useState(is_liked);
    const [likes, setLikes] = useState(like_count);

    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const [saving, setSaving] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [likersOpen, setLikersOpen] = useState(false);
    const [likersLoading, setLikersLoading] = useState(false);
    const [likers, setLikers] = useState([]);

    const editRef = useRef(null);

    useEffect(() => {
        const editEl = editRef.current;
        if (editing && editEl) {
            autosize(editEl);
            return () => autosize.destroy(editEl);
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
            await likeCommentApi(id);
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
            const data = await getCommentLikersApi(id);
            setLikers(data);
        } finally {
            setLikersLoading(false);
        }
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
            await editCommentApi(id, newText);
            toast({ description: t("comment_edit_success"), position: "top", status: "success", duration: 2000 });
        } catch {
            toast({ description: t("comment_edit_error"), position: "top", status: "error", duration: 2000 });
            setDisplayText(lastText);
            setEdited(wasEdited);
            setEditing(true);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => setConfirmOpen(true);

    const onConfirmDelete = async () => {
        try {
            await deleteCommentApi(id);
            setConfirmOpen(false);
            toast({ description: t("comment_delete_success"), position: "top", status: "success", duration: 2000 });
            if (onDelete) onDelete(id);
        } catch {
            toast({ description: t("comment_delete_error"), position: "top", status: "error", duration: 2000 });
        }
    };

    return (
        <>
            <Box w="full">
                <Flex align="center" w="full">
                    <HStack spacing={3} cursor="pointer" onClick={() => navigate(`/${username}`)}>
                        <Avatar size="sm" src={profile_picture || undefined} flexShrink={0} />

                        <VStack align="start" flex="1" minW="0" spacing={0}>
                            <HStack w="full" spacing={1}>
                                {name && (
                                    <Box minW="0">
                                        <Text fontWeight="bold" color={COLOR_4} isTruncated whiteSpace="nowrap">
                                            {name}
                                        </Text>
                                    </Box>
                                )}

                                <Text flexShrink={0} fontSize="sm" color={COLOR_4} whiteSpace="nowrap">
                                    @{username}
                                </Text>
                            </HStack>

                            <Text fontSize="xs" color={COLOR_4}>
                                {formatted_date}
                                {edited && !editing && ` 🞄 (${t("comment_edited")})`}
                            </Text>
                        </VStack>
                    </HStack>
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
                                            color="#EEEEEE"
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
                                            size="sm"
                                        >
                                            {t("edit")}
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <EditablePreview as={Text} whiteSpace="pre-wrap" color={COLOR_4} w="full" />
                            )}
                        </>
                    )}
                </Editable>
                <Divider mt={2} />
                <HStack spacing={0}>
                    <ActionButton icon={liked ? FaHeart : FaRegHeart} onClick={handleLike} active={liked} />
                    <Text color={COLOR_4} cursor="pointer" onClick={openLikers} pl={2} pr={4} fontSize="sm">
                        {likes} {t("likes")}
                    </Text>
                    <Spacer />
                    {is_mine && (
                        <>
                            {!editing && <ActionButton icon={FaEdit} onClick={startEditing} />}
                            <ActionButton icon={FaTrash} onClick={handleDelete} />
                        </>
                    )}
                </HStack>
                <Divider />
            </Box>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={onConfirmDelete}
                title={t("confirm_delete_title")}
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
                title={t("likers_title")}
                loading={likersLoading}
            />
        </>
    );
};

export default Comment;

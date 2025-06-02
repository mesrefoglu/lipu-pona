import {
    Box,
    Flex,
    Avatar,
    Text,
    Button,
    HStack,
    VStack,
    Container,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";
import { followApi, getUserApi, getFollowersApi, getFollowingApi, getPostsApi } from "../api/endpoints.js";
import ListOfUsers from "../components/ListOfUsers.js";
import CreatePost from "../components/CreatePost.js";
import Post from "../components/Post.js";
import ConfirmDialog from "../components/ConfirmDialogue.js";

const UserProfile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const textColor = COLOR_4;
    const secondaryTextColor = "gray.300";

    const { username } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSelf, setIsSelf] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [posts, setPosts] = useState([]);

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [profile, setProfile] = useState({
        username: "",
        first_name: "",
        bio: "",
        profile_picture: "",
        name: "",
        post_count: 0,
        follower_count: 0,
        following_count: 0,
        private: false,
    });

    const [usersModalOpen, setUsersModalOpen] = useState(false);
    const [usersModalTitle, setUsersModalTitle] = useState("");
    const [usersModalLoading, setUsersModalLoading] = useState(false);
    const [usersInModal, setUsersInModal] = useState([]);

    const openFollowers = async () => {
        setUsersModalTitle("jan kute");
        setUsersModalOpen(true);
        setUsersModalLoading(true);
        try {
            const data = await getFollowersApi(username);
            setUsersInModal(data);
        } finally {
            setUsersModalLoading(false);
        }
    };

    const openFollowing = async () => {
        setUsersModalTitle("jan pi kute mi");
        setUsersModalOpen(true);
        setUsersModalLoading(true);
        try {
            const data = await getFollowingApi(username);
            setUsersInModal(data);
        } finally {
            setUsersModalLoading(false);
        }
    };

    const handleFollowButton = async () => {
        const data = await followApi(username);
        if (data) {
            setIsFollowing(!isFollowing);
            setProfile((prev) => ({
                ...prev,
                follower_count: isFollowing ? prev.follower_count - 1 : prev.follower_count + 1,
            }));
        }
    };

    const onConfirmLogout = () => {
        setConfirmOpen(false);
        logout();
    };

    const handlePostDeleted = (deletedId) => {
        setPosts((prev) => prev.filter((p) => p.id !== deletedId));
        setProfile((prev) => ({
            ...prev,
            post_count: Math.max(prev.post_count - 1, 0),
        }));
    };

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                const data = await getUserApi(username, { signal: controller.signal });
                setIsSelf(data.is_self);
                setIsFollowing(data.is_following);
                setProfile(data);
            } catch {
                setError("User not found");
            } finally {
                setLoading(false);
            }
        })();
        return () => controller.abort();
    }, [username]);

    useEffect(() => {
        (async () => {
            try {
                const data = await getPostsApi(username);
                setPosts(data);
            } catch {}
        })();
    }, [username]);

    if (loading) return <></>;

    if (error)
        return (
            <Container maxW="container.md" py={8}>
                <Alert
                    status="error"
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    height="200px"
                    borderRadius="md"
                    bg="rgba(0, 0, 0, 0.6)"
                >
                    <AlertIcon boxSize="40px" mr={0} color="red.500" />
                    <AlertTitle mt={4} mb={1} fontSize="lg" color={textColor}>
                        User Not Found
                    </AlertTitle>
                    <AlertDescription maxWidth="sm" color={secondaryTextColor}>
                        The username "{username}" doesn't exist.
                    </AlertDescription>
                </Alert>
            </Container>
        );

    return (
        <Box maxW="container.sm" mx="auto" p={2}>
            <Flex direction={{ base: "column", md: "row" }} align={{ base: "center", md: "flex-start" }} mb={4}>
                <Box mr={{ base: 0, md: 10 }} mb={{ base: 6, md: 0 }}>
                    <Avatar size="2xl" src={profile.profile_picture || undefined} />
                </Box>

                <VStack align="flex-start" flex={1} spacing={4}>
                    <Text fontWeight="bold" color={textColor} mb={{ base: 4, sm: 0 }}>
                        @{profile.username}
                    </Text>

                    {isSelf ? (
                        <HStack spacing={1} w={{ base: "full", sm: "auto" }}>
                            <Button
                                bg={COLOR_4}
                                color={COLOR_1}
                                _hover={{ bg: COLOR_3, color: textColor }}
                                size="sm"
                                borderRadius="md"
                                onClick={() => {
                                    navigate("/account/edit");
                                }}
                            >
                                o ante e lipu mi
                            </Button>
                            <Button
                                bg={"transparent"}
                                border={"2px"}
                                borderColor={"red.500"}
                                color={textColor}
                                _hover={{ bg: "red.500" }}
                                size="sm"
                                ml={{ base: 1, sm: 4 }}
                                w={{ base: "auto", sm: "auto" }}
                                onClick={() => {
                                    setConfirmOpen(true);
                                }}
                            >
                                o tawa weka
                            </Button>
                        </HStack>
                    ) : (
                        <Button
                            bg={isFollowing ? "transparent" : COLOR_3}
                            w={{ base: "full", sm: "auto" }}
                            border="2px"
                            borderColor={isFollowing ? COLOR_3 : "transparent"}
                            color={textColor}
                            _hover={isFollowing ? { bg: COLOR_3 } : { bg: COLOR_4, color: COLOR_1 }}
                            size="sm"
                            onClick={handleFollowButton}
                        >
                            {isFollowing ? "o kute ala" : "o kute"}
                        </Button>
                    )}

                    <HStack spacing={6} py={2}>
                        <HStack>
                            <Text fontWeight="bold" color={textColor}>
                                {profile.post_count}
                            </Text>
                            <Text color={secondaryTextColor}>pana</Text>
                        </HStack>

                        <HStack onClick={openFollowers} cursor="pointer">
                            <Text fontWeight="bold" color={textColor}>
                                {profile.follower_count}
                            </Text>
                            <Text color={secondaryTextColor}>jan kute</Text>
                        </HStack>

                        <HStack onClick={openFollowing} cursor="pointer">
                            <Text fontWeight="bold" color={textColor}>
                                {profile.following_count}
                            </Text>
                            <Text color={secondaryTextColor}>jan pi kute mi</Text>
                        </HStack>
                    </HStack>

                    <VStack align="flex-start" spacing={1}>
                        <Text fontWeight="medium" color={textColor} maxW="460px">
                            {profile.first_name}
                        </Text>
                        <Text color={textColor} whiteSpace="pre-wrap" maxW="460px">
                            {profile.bio}
                        </Text>
                    </VStack>
                </VStack>
            </Flex>

            {isSelf && (
                <CreatePost
                    onPostCreated={(newPost) => {
                        setPosts((prev) => [newPost, ...prev]);
                        setProfile((prev) => ({
                            ...prev,
                            post_count: prev.post_count + 1,
                        }));
                    }}
                />
            )}

            <VStack spacing={6} mt={4}>
                {posts.map((post) => (
                    <Post
                        key={post.id}
                        {...post}
                        name={profile.first_name}
                        profile_picture={profile.profile_picture}
                        onDelete={handlePostDeleted}
                    />
                ))}
            </VStack>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={onConfirmLogout}
                title="sin wile ala wile e tawa weka tan insa?"
                description=""
                confirmText="wile"
                cancelText="ala"
                headerTextColor={COLOR_1}
                bodyTextColor={COLOR_1}
                cancelButtonColorScheme="gray"
                confirmButtonColorScheme="red"
            />

            <ListOfUsers
                isOpen={usersModalOpen}
                onClose={() => setUsersModalOpen(false)}
                users={usersInModal}
                title={usersModalTitle}
                loading={usersModalLoading}
            />
        </Box>
    );
};

export default UserProfile;

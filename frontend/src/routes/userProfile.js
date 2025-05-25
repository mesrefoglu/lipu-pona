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
import { useParams } from "react-router-dom";

import { API_URL, COLOR_1, COLOR_3, COLOR_4 } from "../constants/constants.js";
import { useAuth } from "../contexts/useAuth.js";
import { followApi, getUserApi, getPostsApi } from "../api/endpoints.js";
import Post from "../components/Post.js";
import ConfirmDialog from "../components/ConfirmDialogue.js";

const UserProfile = () => {
    const { logout } = useAuth();
    const textColor = COLOR_4;
    const secondaryTextColor = "gray.300";

    const { username } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSelf, setIsSelf] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [posts, setPosts] = useState([]);

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

    const [confirmOpen, setConfirmOpen] = useState(false);

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
        <>
            <Container maxW="container.md" py={8}>
                <Box borderRadius="md" p={4}>
                    <Flex direction={{ base: "column", md: "row" }} alignItems="center" mb={6}>
                        <Box mr={{ base: 0, md: 10 }} mb={{ base: 6, md: 0 }}>
                            <Avatar
                                size="2xl"
                                src={profile.profile_picture ? API_URL + profile.profile_picture : undefined}
                            />
                        </Box>

                        <VStack align="flex-start" flex={1} spacing={4}>
                            <Flex
                                direction={{ base: "column", sm: "row" }}
                                alignItems={{ base: "flex-start", sm: "center" }}
                                w="full"
                                mb={2}
                            >
                                <Text fontSize="xl" fontWeight="bold" color={textColor} mb={{ base: 4, sm: 0 }}>
                                    @{profile.username}
                                </Text>

                                {isSelf ? (
                                    <HStack ml={{ base: 0, sm: 4 }} spacing={2} w={{ base: "full", sm: "auto" }}>
                                        <Button
                                            bg={COLOR_4}
                                            color={COLOR_1}
                                            _hover={{ bg: COLOR_3, color: textColor }}
                                            size="sm"
                                            borderRadius="md"
                                            px={6}
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
                                            px={6}
                                            ml={{ base: 0, sm: 4 }}
                                            w={{ base: "full", sm: "auto" }}
                                            onClick={() => {
                                                setConfirmOpen(true);
                                            }}
                                        >
                                            o tawa weka tan insa
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Button
                                        bg={isFollowing ? "transparent" : COLOR_3}
                                        ml={{ base: 0, sm: 4 }}
                                        w={{ base: "full", sm: "auto" }}
                                        border="2px"
                                        borderColor={isFollowing ? COLOR_3 : "transparent"}
                                        color={textColor}
                                        _hover={isFollowing ? { bg: COLOR_3 } : { bg: COLOR_4, color: COLOR_1 }}
                                        size="sm"
                                        px={6}
                                        onClick={handleFollowButton}
                                    >
                                        {isFollowing ? "o kute ala" : "o kute"}
                                    </Button>
                                )}
                            </Flex>

                            <HStack spacing={6} py={2}>
                                <HStack>
                                    <Text fontWeight="bold" color={textColor}>
                                        {profile.post_count || 0}
                                    </Text>
                                    <Text color={secondaryTextColor}>pana</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold" color={textColor}>
                                        {profile.follower_count}
                                    </Text>
                                    <Text color={secondaryTextColor}>jan kute</Text>
                                </HStack>
                                <HStack>
                                    <Text fontWeight="bold" color={textColor}>
                                        {profile.following_count}
                                    </Text>
                                    <Text color={secondaryTextColor}>jan li mi kute</Text>
                                </HStack>
                            </HStack>

                            <VStack align="flex-start" spacing={1}>
                                <Text fontWeight="medium" color={textColor}>
                                    {profile.first_name}
                                </Text>
                                <Text color={textColor}>{profile.bio}</Text>
                            </VStack>
                        </VStack>
                    </Flex>

                    <VStack spacing={6} mt={8}>
                        {posts.map((post) => (
                            <Post
                                key={post.id}
                                {...post}
                                authorName={profile.first_name}
                                authorPic={profile.profile_picture}
                                onDelete={(deletedId) =>
                                    setPosts((prev) => prev.filter((post) => post.id !== deletedId))
                                }
                            />
                        ))}
                    </VStack>
                </Box>
            </Container>
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={onConfirmLogout}
                title="o tawa weka tan insa anu seme?"
                description=""
                confirmText="o tawa"
                cancelText="ala"
                headerTextColor={COLOR_1}
                bodyTextColor={COLOR_1}
                cancelButtonColorScheme="gray"
                confirmButtonColorScheme="red"
            />
        </>
    );
};

export default UserProfile;

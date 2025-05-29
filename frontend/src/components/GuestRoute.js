import { Spinner, Center } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/useAuth.js";

const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner />
            </Center>
        );
    }

    return !user ? children : <Navigate to="/" replace />;
};

export default GuestRoute;

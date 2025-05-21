import { Text } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/useAuth.js";

const PrivateRoute = ({ children }) => {
    const { auth, loading } = useAuth();

    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (auth) {
        return children;
    } else {
        return <Navigate to="/account/login" replace />;
    }
};

export default PrivateRoute;

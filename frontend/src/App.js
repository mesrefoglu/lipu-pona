import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import Layout from "./components/layout.js";
import PrivateRoute from "./components/privateRoute.js";

import Home from "./routes/home.js";
import Login from "./routes/login.js";
import UserProfile from "./routes/userProfile.js";
import Register from "./routes/register.js";

import { AuthProvider } from "./contexts/useAuth.js";

function App() {
    return (
        <ChakraProvider>
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Layout>
                                    <PrivateRoute>
                                        <Home />
                                    </PrivateRoute>
                                </Layout>
                            }
                        />
                        <Route
                            path="/:username"
                            element={
                                <Layout>
                                    <PrivateRoute>
                                        <UserProfile />
                                    </PrivateRoute>
                                </Layout>
                            }
                        />
                        <Route
                            path="/account/login"
                            element={
                                <Layout>
                                    <Login />
                                </Layout>
                            }
                        />
                        <Route
                            path="/account/register"
                            element={
                                <Layout>
                                    <Register />
                                </Layout>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </Router>
        </ChakraProvider>
    );
}

export default App;

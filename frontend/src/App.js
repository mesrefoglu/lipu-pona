import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import Layout from "./components/Layout.js";
import PrivateRoute from "./components/PrivateRoute.js";
import GuestRoute from "./components/GuestRoute.js";
import { AuthProvider } from "./contexts/useAuth.js";

import Home from "./routes/Home.js";
import UserProfile from "./routes/UserProfile.js";
import SinglePost from "./routes/SinglePost.js";
import EditPost from "./routes/EditPost.js";
import Login from "./routes/Login.js";
import ForgotPassword from "./routes/ForgotPassword.js";
import ResetPassword from "./routes/ResetPassword.js";
import Register from "./routes/Register.js";
import EditUser from "./routes/EditUser.js";

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
                            path="/post/:id"
                            element={
                                <Layout>
                                    <PrivateRoute>
                                        <SinglePost />
                                    </PrivateRoute>
                                </Layout>
                            }
                        />
                        <Route
                            path="/post/edit/:id"
                            element={
                                <Layout>
                                    <PrivateRoute>
                                        <EditPost />
                                    </PrivateRoute>
                                </Layout>
                            }
                        />
                        <Route
                            path="/account/login"
                            element={
                                <Layout>
                                    <GuestRoute>
                                        <Login />
                                    </GuestRoute>
                                </Layout>
                            }
                        />
                        <Route
                            path="/account/forgot-password"
                            element={
                                <Layout>
                                    <GuestRoute>
                                        <ForgotPassword />
                                    </GuestRoute>
                                </Layout>
                            }
                        />
                        <Route
                            path="/reset-password/:uid/:token"
                            element={
                                <Layout>
                                    <GuestRoute>
                                        <ResetPassword />
                                    </GuestRoute>
                                </Layout>
                            }
                        />
                        <Route
                            path="/account/register"
                            element={
                                <Layout>
                                    <GuestRoute>
                                        <Register />
                                    </GuestRoute>
                                </Layout>
                            }
                        />
                        <Route
                            path="/account/edit"
                            element={
                                <Layout>
                                    <PrivateRoute>
                                        <EditUser />
                                    </PrivateRoute>
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

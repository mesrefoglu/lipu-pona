import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import Layout from "./components/Layout.js";
import PrivateRoute from "./components/PrivateRoute.js";
import GuestRoute from "./components/GuestRoute.js";
import { AuthProvider } from "./contexts/useAuth.js";

import Home from "./routes/Home.js";
import Login from "./routes/Login.js";
import UserProfile from "./routes/UserProfile.js";
import SinglePost from "./routes/SinglePost.js";
import Register from "./routes/Register.js";
import CreatePost from "./routes/CreatePost.js";
import EditPost from "./routes/EditPost.js";

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
                            path="/post/create"
                            element={
                                <Layout>
                                    <PrivateRoute>
                                        <CreatePost />
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
                            path="/account/register"
                            element={
                                <Layout>
                                    <GuestRoute>
                                        <Register />
                                    </GuestRoute>
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

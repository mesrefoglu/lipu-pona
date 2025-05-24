import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import Layout from "./components/layout.js";
import PrivateRoute from "./components/privateRoute.js";
import GuestRoute from "./components/guestRoute.js";
import { AuthProvider } from "./contexts/useAuth.js";

import Home from "./routes/home.js";
import Login from "./routes/login.js";
import UserProfile from "./routes/userProfile.js";
import SinglePost from "./routes/singlePost.js";
import Register from "./routes/register.js";
import CreatePost from "./routes/createPost.js";
import EditPost from "./routes/editPost.js";

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

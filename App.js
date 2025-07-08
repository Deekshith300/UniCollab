/*
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route, useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { motion } from 'framer-motion';
import Signup from "./Signup.js";
import Login from "./Login.js";
import Home from "./Home.js";
import CreatePost from "./CreatePost.js";
import Profile from "./Profile.js";
import PostDetails from "./PostDetails.js";
import Groups from "./Groups.js";
import GroupDetails from "./GroupDetails.js";
import ChatList from "./ChatList.js";
import Chat from "./Chat.js";
import NotesList from "./NotesList.js";
import NoteDetail from "./NoteDetail.js";
import CreateNote from "./CreateNote.js";
import ResourcesList from "./ResourcesList.js";
import ResourceDetail from "./ResourceDetail.js";
import CreateResource from "./CreateResource.js";
import Analytics from "./Analytics.js";
import TaskManagement from "./TaskManagement.js";
import Blog from "./Blog";
import Footer from "./Footer";
import NotFound from "./NotFound";
import PublicProfile from "./PublicProfile";
import AdminDashboard from "./AdminDashboard";
import ModeratorDashboard from "./ModeratorDashboard";
import GlobalSearch from "./GlobalSearch";
import ToastManager from "./components/ToastManager";
import './PageTransition.css';
import About from "./About";
import Contact from "./Contact";
import PostsPage from "./PostsPage";
import ServicesPage from "./ServicesPage";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Navbar from "./components/Navbar";

function AnimatedRoutes() {
  const location = useLocation();
  const nodeRef = React.useRef(null);
  
  return (
    <TransitionGroup>
      <CSSTransition key={location.pathname} classNames="fade" timeout={350} nodeRef={nodeRef}>
        <div ref={nodeRef} className="animate-fade-in">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/posts/:id" element={<PostDetails />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:id" element={<GroupDetails />} />
              <Route path="/chats" element={<ChatList />} />
              <Route path="/chats/:chatId" element={<Chat />} />
              <Route path="/notes" element={<NotesList />} />
              <Route path="/notes/:id" element={<NoteDetail />} />
              <Route path="/notes/create" element={<CreateNote />} />
              <Route path="/notes/edit/:id" element={<CreateNote />} />
              <Route path="/resources" element={<ResourcesList />} />
              <Route path="/resources/:id" element={<ResourceDetail />} />
              <Route path="/resources/create" element={<CreateResource />} />
              <Route path="/resources/edit/:id" element={<CreateResource />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/tasks" element={<TaskManagement />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/user/:username" element={<PublicProfile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/moderator" element={<ModeratorDashboard />} />
              <Route path="/search" element={<GlobalSearch />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <AnimatedRoutes />
        <Footer />
        <ToastManager />
      </div>
    </Router>
  );
}

const mockPosts = [
  { id: 1, title: "Welcome Post", content: "Hello, this is the first post!", author: { name: "Alice" } },
  { id: 2, title: "Second Post", content: "Another post for testing.", author: { name: "Bob" } }
];

// In your render:
mockPosts.map(post => (
  <div key={post.id}>
    <h2>{post.title}</h2>
    <p>{post.content}</p>
    <small>By {post.author.name}</small>
  </div>
))
export default App;
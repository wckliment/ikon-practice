import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import {
  fetchUsers,
  fetchConversation,
  sendMessage,
  selectUser,
  clearSelectedUser,
  togglePinUser // Added import
} from "../redux/chatSlice";

const CommunicationHub = () => {
  const dispatch = useDispatch();
  const { users = [], messages = [], selectedUser, loading } = useSelector((state) => state.chat);
  const [newMessageText, setNewMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Get current logged-in user from Redux
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

  // Debug Redux state
  const chatState = useSelector((state) => state.chat);
  console.log('Chat state from Redux:', chatState);
  console.log('Current user from Redux:', currentUser);

  // Fetch users on component mount
  useEffect(() => {
    console.log('Fetching all users');
    dispatch(fetchUsers());
  }, [dispatch]);

  // Log users when they change
  useEffect(() => {
    console.log('Users data received:', users);
  }, [users]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      console.log('Fetching conversation for user:', selectedUser.id);
      dispatch(fetchConversation(selectedUser.id));
    }
  }, [selectedUser, dispatch]);

  // Log messages when they change
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  // Auto-select a user for testing
  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      // Look for the first user that is not the current user
      const targetUser = users.find(u => u.id !== currentUser.id);

      if (targetUser) {
        console.log('Auto-selecting user for testing:', targetUser);
        dispatch(selectUser(targetUser));
      } else {
        console.log('Could not find another user to select');
        console.log('Available users:', users);
      }
    }
  }, [users, selectedUser, dispatch, currentUser]);

  // Handle user selection
  const handleSelectUser = (user) => {
    console.log('User selected manually:', user);
    dispatch(selectUser(user));
  };

  // Handle message submission
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("You must be logged in to send messages");
      return;
    }

    if (!selectedUser || !newMessageText.trim() || !currentUser.id) {
      console.log('Cannot send message:', {
        isAuthenticated,
        selectedUser: !!selectedUser,
        newMessageText: !!newMessageText.trim(),
        currentUserId: currentUser?.id
      });
      return;
    }

    console.log('Sending message:', {
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      message: newMessageText
    });

    dispatch(sendMessage({
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,  // Changed from recipient_id to receiver_id
      message: newMessageText        // Changed from content to message
    }));

    setNewMessageText("");
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    if (!messages.length) return {};

    const grouped = {};

    messages.forEach(message => {
      const date = new Date(message.created_at);
      const dateStr = date.toDateString();

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }

      grouped[dateStr].push(message);
    });

    // Sort messages within each group by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });

    return grouped;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().substr(-2);
    return `${day} ${month}, ${year}`;
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get user initials from name
  const getUserInitials = (name) => {
    if (!name) return "";

    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
    }

    return parts[0].substring(0, 2).toUpperCase();
  };

  // Filter users based on search query
  const filteredUsers = Array.isArray(users)
    ? users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Get pinned and regular users
  const pinnedUsers = Array.isArray(filteredUsers)
    ? filteredUsers.filter(user => user.pinned && user.id !== currentUser?.id)
    : [];
  const regularUsers = Array.isArray(filteredUsers)
    ? filteredUsers.filter(user => !user.pinned && user.id !== currentUser?.id)
    : [];

  // Group messages by date
  const groupedMessages = groupMessagesByDate();
  const messagesByDate = Object.keys(groupedMessages).sort((a, b) => new Date(b) - new Date(a));

  // Add this handler function for pinning/unpinning users
  const handleTogglePin = (user, e) => {
    // Stop the click from selecting the user
    e.stopPropagation();

    console.log(`${user.pinned ? 'Unpinning' : 'Pinning'} user:`, user.name);
    dispatch(togglePinUser({
      userId: user.id,
      isPinned: !user.pinned
    }));
  };

  return (
    <div className="h-screen" style={{ backgroundColor: "#EBEAE6" }}>
      {/* Main App Sidebar - Fixed position */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-20" style={{ backgroundColor: "#EBEAE6" }}>
        {/* Top Bar */}
        <TopBar />

        {/* Custom Header for Communication Hub */}
        <div className="px-4 py-2 flex items-center">
          <h1 className="text-4xl font-bold text-gray-800 ml-16 mt-14">
            Communication Hub
          </h1>
        </div>

        {/* Communication Hub Content */}
        <div className="p-6 mt-6 ml-10">
          <div className="flex space-x-4">
            {/* Left Panel - Chats List */}
            <div className="w-72 bg-white rounded-lg shadow overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-lg">Chats</h2>
                <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-lg leading-none">+</span>
                </button>
              </div>

              <div className="p-3">
                <input
                  type="text"
                  placeholder="Search users & messages..."
                  className="w-full p-2 border rounded-md text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 flex items-center">
                  <span className="mr-1">📌</span> Pinned Chats
                </p>
              </div>

              <div className="overflow-y-auto flex-1">
                {/* Pinned Chats */}
                <div className="px-2">
                  {loading ? (
                    <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                  ) : (
                    // If there are pinned users, show them, otherwise show a message
                    pinnedUsers.length > 0 ? (
                      pinnedUsers.map((user) => (
                        <div
                          key={user.id}
                         className={`flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer relative ${
  selectedUser?.id === user.id ? 'bg-blue-50' : ''
}`}
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                            {getUserInitials(user.name)}
                          </div>
                          <div className="ml-2 flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className={`font-medium text-sm truncate ${
  selectedUser?.id === user.id ? 'text-blue-600' : ''
}`}>{user.name}</p>
                              <span className="text-xs text-gray-500">
                                {user.last_message_time ? formatTime(user.last_message_time) : ''}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {user.last_message || 'No messages'}
                            </p>
                          </div>
                          {user.unread_count > 0 && (
                            <div className="ml-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                              {user.unread_count}
                            </div>
                          )}

                          {/* Add unpin button */}
                          <button
  className="absolute right-2 top-2 text-amber-500 hover:text-gray-400 focus:outline-none"
  onClick={(e) => handleTogglePin(user, e)}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
</button>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-xs text-gray-500">No pinned chats</div>
                    )
                  )}
                </div>

                {/* Recent Chats Header */}
                <div className="px-3 py-2 mt-2">
                  <p className="text-xs font-semibold text-gray-500">Recent Chats</p>
                </div>

                {/* Recent Chats */}
                <div className="px-2">
                  {loading ? (
                    <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                  ) : (
                    regularUsers.length > 0 ? (
                      regularUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer relative ${
  selectedUser?.id === user.id ? 'bg-blue-50' : ''
}`}
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                            {getUserInitials(user.name)}
                          </div>
                          <div className="ml-2 flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className={`font-medium text-sm truncate ${
  selectedUser?.id === user.id ? 'text-blue-600' : ''
}`}>{user.name}</p>
                              <span className="text-xs text-gray-500">
                                {user.last_message_time ? formatTime(user.last_message_time) : ''}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {user.last_message || 'No messages'}
                            </p>
                          </div>
                          {user.unread_count > 0 && (
                            <div className="ml-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                              {user.unread_count}
                            </div>
                          )}

                          {/* Add pin button */}
                          <button
  className="absolute right-2 top-2 text-gray-400 hover:text-amber-500 focus:outline-none"
  onClick={(e) => handleTogglePin(user, e)}
>
  📌
</button>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-xs text-gray-500">No chats available</div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Middle Panel - Chat Messages */}
            <div className="w-[calc(100%-800px)] min-w-[400px] bg-white rounded-lg shadow overflow-hidden flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center">
                  {selectedUser ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                        {getUserInitials(selectedUser.name)}
                      </div>
                      <div className="ml-2">
                        <p className="font-medium">{selectedUser.name}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">Select a user to start chatting</p>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border rounded-md px-2 py-1 text-sm mr-2"
                  />
                  <button className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading && messages.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">Loading messages...</div>
                ) : !selectedUser ? (
                  <div className="p-3 text-center text-sm text-gray-500">Select a user to view messages</div>
                ) : messages.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">No messages yet. Start a conversation!</div>
                ) : (
                  messagesByDate.map(date => (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="py-2 px-4 text-center">
                        <span className="text-xs text-gray-500">{formatDate(date)}</span>
                      </div>

                      {/* Messages for this date */}
                      {groupedMessages[date].map(message => {
                        console.log('Rendering message:', message);
                        const isSentByMe = message.sender_id === currentUser?.id;

                        return (
                          <div key={message.id}>
                            <div className={`flex ${isSentByMe ? 'justify-end' : ''}`}>
                              <div className={`max-w-xs lg:max-w-md rounded-lg ${
                                isSentByMe ? 'bg-green-100' : 'bg-blue-100'
                              } p-3 text-sm`}>
                                <p>{message.message}</p>  {/* Using message.message instead of message.content */}
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              {formatTime(message.created_at)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 border-t">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    disabled={!selectedUser}
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-gray-300"
                    disabled={!selectedUser || !newMessageText.trim()}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>

            {/* Right Panel - Contact Details */}
            <div className="w-[480px] bg-white rounded-lg shadow overflow-hidden flex flex-col">
              {selectedUser ? (
                <>
                  <div className="p-3 border-b flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                      {getUserInitials(selectedUser.name)}
                    </div>
                    <div className="ml-2">
                      <p className="font-medium">{selectedUser.name}</p>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        <span className="text-xs text-gray-500">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 overflow-y-auto flex-1">
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-amber-600 mb-2">Contact Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="text-gray-500 text-sm w-16">Phone:</span>
                          <span className="text-sm">{selectedUser.phone || 'Not available'}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-500 text-sm w-16">Email:</span>
                          <span className="text-sm">{selectedUser.email}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-500 text-sm w-16">Role:</span>
                          <span className="text-sm">{selectedUser.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-amber-600 mb-2">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="flex items-center justify-center text-sm border rounded-md py-2 hover:bg-gray-50">
                          <span>Call User</span>
                        </button>
                        <button className="flex items-center justify-center text-sm border rounded-md py-2 hover:bg-gray-50">
                          <span>Send Message</span>
                        </button>
                        <button className="flex items-center justify-center text-sm border rounded-md py-2 hover:bg-gray-50">
                          <span>Send Forms</span>
                        </button>
                        <button className="flex items-center justify-center text-sm border rounded-md py-2 hover:bg-gray-50">
                          <span>Send Link</span>
                        </button>
                        <button className="flex items-center justify-center text-sm border rounded-md py-2 hover:bg-gray-50 col-span-2">
                          <span>Schedule Appointment</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-amber-600 mb-2">User Info</h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="text-gray-500 text-sm w-24">Created:</span>
                          <span className="text-sm">{selectedUser.created_at ? formatDate(selectedUser.created_at) : 'N/A'}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-500 text-sm w-24">DOB:</span>
                          <span className="text-sm">{selectedUser.dob ? formatDate(selectedUser.dob) : 'N/A'}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-500 text-sm w-24">Last Message:</span>
                          <span className="text-sm">
                            {messages.length > 0
                              ? `${formatDate(messages[0].created_at)}, "${messages[0].message?.substring(0, 20)}${messages[0].message?.length > 20 ? '...' : ''}"`
                              : 'No messages yet'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>Select a user to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;

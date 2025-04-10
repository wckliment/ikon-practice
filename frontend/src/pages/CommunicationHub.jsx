import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import NewChatModal from "../components/NewChatModal";
import {
  fetchUsers,
  fetchConversation,
  sendMessage,
  selectUser,
  clearSelectedUser,
  togglePinUser,
  fetchAllMessages,
  fetchPatientCheckIns,
  createNewChat,
  deleteMessage,
  deleteConversation,
  updateUnreadCount
} from "../redux/chatSlice";
import { socket, connectSocket } from "../socket";
import { addMessageViaSocket } from "../redux/chatSlice";

const CommunicationHub = () => {
  const dispatch = useDispatch();
  const { users = [], messages = [], allMessages = [], patientCheckIns = [], selectedUser, loading } = useSelector((state) => state.chat);
  useEffect(() => {
  console.log("🔄 Redux messages state updated:", messages);
  }, [messages]);
  console.log("🧠 allMessages from Redux:", allMessages); // <--- add this here
  console.log("👨‍⚕️ patientCheckIns from Redux:", patientCheckIns); // ✅ add this

  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

  const [newMessageText, setNewMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [selectedUserContext, setSelectedUserContext] = useState(null);
  const [selectedPatientCheckIns, setSelectedPatientCheckIns] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const bottomRef = useRef(null);

 useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    connectSocket(token);

    socket.on("connect", () => {
      console.log("🧩 Connected to socket server");
    });

    socket.on("disconnect", () => {
      console.log("🔌 Disconnected from socket server");
    });

    socket.on("test", (data) => {
      console.log("🧪 Received test message:", data);
    });

    socket.on("newMessage", (message) => {
      console.log("🔎 SOCKET DEBUGGING - Raw message received:", message);
      console.log("🔎 SOCKET DEBUGGING - Is system message?", message.is_system === true, "Type:", message.type);

      dispatch(addMessageViaSocket(message));

      // ✅ Real-time update unread badge
      if (message.receiver_id === currentUser?.id && !message.is_read) {
        dispatch(updateUnreadCount({
          userId: message.sender_id,
          unreadCount: (users.find(u => u.id === message.sender_id)?.unread_count || 0) + 1
        }));
      }

      // 🔔 System message logic
      if (message.is_system === true) {
        console.log("🔔 System message detected:", message);

        if (selectedPatientCheckIns) {
          // Could refresh view or highlight
        }

        if (message.message.includes("ready to go back")) {
          setSystemAlert(message);

          setTimeout(() => {
            setSystemAlert(null);
          }, 10000);
        }
      }

      // 🧵 Regular conversation updates (if needed)
      else if (
        selectedUser &&
        (message.sender_id === selectedUser.id || message.receiver_id === selectedUser.id)
      ) {
        // You could optionally re-fetch here
      } else {
        console.log("🧵 Message handled via socket - no fetch needed");
      }
    });
  }

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("newMessage");
  };
}, [dispatch, selectedUser, selectedUserContext, users, currentUser, selectedPatientCheckIns]);




// Fetch initial data when component mounts
useEffect(() => {
  const fetchData = async () => {
    console.log("🔄 Fetching initial data...");
    await Promise.all([
      dispatch(fetchUsers()),
      dispatch(fetchAllMessages()),
      dispatch(fetchPatientCheckIns())
    ]);
    console.log("✅ Finished fetching initial data.");
  };

  fetchData();
}, [dispatch]);

    // Add the new debugging useEffect here
  useEffect(() => {
    if (users.length > 0 && currentUser) {
      console.log("User filtering debug:");
      console.log("Current user location:", currentUser.location_id);
      console.log("All fetched users with their locations:",
        users.map(u => ({
          id: u.id,
          name: u.name,
          location_id: u.location_id,
          location_name: u.location_name
        }))
      );
    }
  }, [users, currentUser]);

    // Add this as a separate useEffect - not nested inside the previous one
useEffect(() => {
  if (dataLoaded && users.length > 0 && allMessages.length > 0) {
    console.log("Data loaded, forcing re-render");

    // Use a one-time flag to prevent infinite loops
    if (!window.hasForceRendered) {
      window.hasForceRendered = true;

      // Force component to re-filter and re-render
      const current = searchQuery || '';
      setSearchQuery(current + ' ');
      setTimeout(() => setSearchQuery(current), 10);
    }
  }
}, [dataLoaded, users.length, allMessages.length]);

  useEffect(() => {
  if (currentUser) {
    console.log("Current user information:", {
      id: currentUser.id,
      name: currentUser.name,
      location_id: currentUser.location_id,
      location: currentUser.location // If the location name is included
    });
  }
}, [currentUser]);

  useEffect(() => {
  const testAuth = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Test auth status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Test auth response:", data);
      } else {
        console.log("Auth failed with status:", response.status);
      }
    } catch (err) {
      console.error("Test auth error:", err);
    }
  };

  testAuth();
}, []); // Empty dependency array means this runs once on mount


useEffect(() => {
  if (allMessages.length > 0) {
    console.log("All message types:", [...new Set(allMessages.map(msg => msg.type))]);
    console.log("General messages count:", allMessages.filter(msg => msg.type === 'general' || msg.type === null).length);
    console.log("Patient check-in messages count:", allMessages.filter(msg => msg.type === 'patient-check-in').length);
  }
}, [allMessages]);

  useEffect(() => {
  const broadcastMessages = allMessages.filter(msg =>
    msg.type === 'patient-check-in' &&
    (msg.receiver_id === -1 || msg.receiver_id === null)
  );

  dispatch({
    type: 'chat/fetchPatientCheckIns/fulfilled',
    payload: broadcastMessages
  });
}, [allMessages, dispatch]);

  // Reset selected patient check-ins when a user is selected
  useEffect(() => {
    if (selectedUser) {
      setSelectedPatientCheckIns(false);
    }
  }, [selectedUser]);

  useEffect(() => {
  if (selectedUser) {
    const messageType =
      selectedUserContext === 'patient-check-in'
        ? 'patient-check-in'
        : 'general';

    // Fetch the conversation
    dispatch(
      fetchConversation({
        userId: selectedUser.id,
        conversationType: messageType,
      })
    );

    // Mark messages as read on the backend
    fetch(`http://localhost:5000/api/messages/mark-read/${selectedUser.id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => {
        // 🔄 Update unread count in Redux immediately
        dispatch(updateUnreadCount({ userId: selectedUser.id, unreadCount: 0 }));
      })
      .catch((error) => {
        console.error('Failed to mark messages as read:', error);
      });
  }
}, [selectedUser, selectedUserContext, dispatch]);

  // Add this new useEffect after your existing ones
useEffect(() => {
  if (!loading && allMessages.length > 0 && users.length > 0) {
    console.log("Processing user lists with:", {
      usersCount: users.length,
      messagesCount: allMessages.length
    });

    // Force a re-render to ensure lists are populated
    setSearchQuery(searchQuery => searchQuery);
  }
}, [loading, allMessages, users]);

  useEffect(() => {
    if (!optionsMenuOpen) return;

    useEffect(() => {
  console.log("🔄 Chat.messages updated:", messages);
}, [messages]);

  const handleClickOutside = (event) => {
    if (!event.target.closest('[data-options-menu]') &&
        !event.target.closest('button')?.onclick?.toString().includes('setOptionsMenuOpen')) {
      setOptionsMenuOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
  }, [optionsMenuOpen]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, localMessages]);

  // Function to render the patient check-in section in the sidebar
const patientCheckInSection = () => {
  // Filter broadcast messages AND system messages
  const broadcastCheckIns = patientCheckIns.filter(msg =>
     msg => msg.type === 'patient-check-in' || msg.is_system === true
  );

  if (broadcastCheckIns.length === 0) {
    return <div className="p-2 text-xs text-gray-500">No patient check-ins</div>;
  }

  // Count system messages specially
  const systemMessages = broadcastCheckIns.filter(msg => msg.is_system === true);
  const hasReadyToGoBack = systemMessages.some(msg =>
    msg.message.includes("ready to go back")
  );

  // Display a clickable patient check-in item
  return (
    <div
      className={`p-2 hover:bg-gray-50 rounded-md cursor-pointer ${selectedPatientCheckIns ? 'bg-blue-50' : ''} ${hasReadyToGoBack ? 'border-l-4 border-amber-400' : ''}`}
      onClick={() => handleSelectPatientCheckIns()}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium text-xs">
          🏥
        </div>
        <div className="ml-2 flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${selectedPatientCheckIns ? 'text-blue-600' : ''}`}>
            Patient Check-ins
          </p>
          <p className="text-xs text-gray-500 truncate">
            {broadcastCheckIns.length} recent check-ins
            {systemMessages.length > 0 && ` (${systemMessages.length} system)`}
          </p>
        </div>
        {hasReadyToGoBack && (
          <div className="ml-2 w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

  // Handle selecting patient check-ins
  const handleSelectPatientCheckIns = () => {
    setSelectedPatientCheckIns(true);
    dispatch(clearSelectedUser());
  };

  // Handle user selection
  const handleSelectUser = (user, context = 'regular') => {

    console.log("📲 Selected user:", user);

    dispatch(selectUser(user));
    setSelectedUserContext(context);
    setSelectedPatientCheckIns(false);
  };

  // Add this function to handle message deletion
const handleDeleteMessage = (messageId) => {
  if (!messageId) return;

  // Confirm before deleting
  if (window.confirm("Are you sure you want to delete this message?")) {
    dispatch(deleteMessage(messageId))
      .then(() => {
        // Optionally refresh the conversation if needed
        if (selectedUser) {
          dispatch(fetchConversation({
            userId: selectedUser.id,
            conversationType: selectedUserContext === 'patient-check-in' ? 'patient-check-in' : 'general'
          }));
        }

        // Also refresh all messages and patient check-ins
        dispatch(fetchAllMessages());
        dispatch(fetchPatientCheckIns());
      })
      .catch(error => {
        console.error("Error deleting message:", error);
        alert("Failed to delete message. Please try again.");
      });
  }
};

// Update handleSendMessage to ensure UI updates immediately
const handleSendMessage = (e) => {
  e.preventDefault();

  if (!isAuthenticated) {
    alert("You must be logged in to send messages");
    return;
  }

  if (!selectedUser || !newMessageText.trim() || !currentUser.id) {
    return;
  }

    // Log what's being sent
  console.log("✉️ Sending message:", {
    from: currentUser?.id,
    to: selectedUser?.id,
    text: newMessageText,
    type: selectedUserContext
  });

  const messageType = selectedUserContext === 'patient-check-in' ? 'patient-check-in' : 'general';

  const tempMessage = {
    id: `temp-${Date.now()}`,
    sender_id: currentUser.id,
    receiver_id: selectedUser.id,
    message: newMessageText,
    created_at: new Date().toISOString(),
    type: messageType,
    is_temporary: true
  };

  setLocalMessages(prev => [tempMessage, ...prev]);

  dispatch(sendMessage({
    sender_id: currentUser.id,
    receiver_id: selectedUser.id,
    message: newMessageText,
    type: messageType
  }))
    .then(() => {
      // Fetch latest conversation first, THEN clear local messages
      dispatch(fetchConversation({
        userId: selectedUser.id,
        conversationType: messageType
      })).then(() => {
        setLocalMessages([]); // Now safe to clear
      });
    })
    .catch(error => {
      console.error("Error sending message:", error);
      setLocalMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessage.id
            ? { ...msg, failed: true }
            : msg
        )
      );
    });

  setNewMessageText("");
};

  // Handle creating a new chat
  const handleCreateChat = (params) => {
    if (params.type === 'patient-check-in') {
      // For patient check-ins, use async/await for better error handling
      handleCreateCheckIn(params.data);
    } else {
      // For regular chats, use the existing createNewChat action
      const { userId, type } = params;
      dispatch(createNewChat({ userId, type }));
      setSelectedUserContext(type === 'patient-check-in' ? 'patient-check-in' : 'regular');
    }
  };

  // Handle patient check-in creation
  const handleCreateCheckIn = async (data) => {
    try {
      const { patientName, appointmentTime, doctorName } = data;

      const token = localStorage.getItem('token');

      // Send data exactly as the backend expects it
      const checkInData = {
        patientName,
        appointmentTime,
        doctorName: doctorName || 'Smith', // Provide a default if empty
        sender_id: currentUser.id
      };

      const response = await fetch('http://localhost:5000/api/messages/patient-check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(checkInData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create patient check-in');
      }

      // Refresh the patient check-ins list
      dispatch(fetchPatientCheckIns());

      // Refresh all messages as well to make sure everything is in sync
      dispatch(fetchAllMessages());

      return responseData;
    } catch (error) {
      console.error('Error creating patient check-in:', error);
      throw error;
    }
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
  if (!dateString || isNaN(new Date(dateString))) return "Invalid date";
  const date = new Date(dateString);
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}, ${date.getFullYear().toString().slice(-2)}`;
};
  // Format time for display
 const formatTime = (dateString) => {
  if (!dateString || isNaN(new Date(dateString))) return "Invalid time";
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

// Get pinned, patient check-in, and regular users
const pinnedUsers = useMemo(() => {
  return Array.isArray(filteredUsers)
    ? filteredUsers.filter(user => user.pinned && user.id !== currentUser?.id)
    : [];
}, [filteredUsers, currentUser?.id]);

// Filter patient check-in users - only include direct messages
const patientCheckInUsers = useMemo(() => {
  if (!Array.isArray(filteredUsers) || !Array.isArray(allMessages)) {
    return [];
  }

  return filteredUsers.filter(user => {
    if (user.pinned || user.id === currentUser?.id) return false;

    return allMessages.some(msg =>
      (msg.type === 'patient-check-in') &&
      ((msg.sender_id === user.id && msg.receiver_id === currentUser?.id) ||
       (msg.sender_id === currentUser?.id && msg.receiver_id === user.id))
    );
  });
}, [filteredUsers, allMessages, currentUser?.id]);

// In CommunicationHub.jsx - Update the regularUsers useMemo
const regularUsers = useMemo(() => {
  console.log("Computing regularUsers with:", {
    filteredUsersLength: filteredUsers?.length || 0,
    allMessagesLength: allMessages?.length || 0,
    currentUserLocation: currentUser?.location_id
  });

  if (!Array.isArray(filteredUsers) || !Array.isArray(allMessages) || allMessages.length === 0) {
    return [];
  }

  return filteredUsers.filter(user => {
    // Skip pinned users, current user, and users from different locations
    if (
      user.pinned ||
      user.id === currentUser?.id ||
      user.location_id !== currentUser?.location_id
    ) {
      console.log(`Filtering out user ${user.name}: pinned=${user.pinned}, isCurrent=${user.id === currentUser?.id}, locationMatch=${user.location_id === currentUser?.location_id}`);
      return false;
    }

    // For debugging, log each user's location
    console.log(`User ${user.name} has location_id: ${user.location_id}, current user location_id: ${currentUser?.location_id}`);

    // Include the user if they have matching location_id
    return true;
  });
}, [filteredUsers, allMessages, currentUser?.id, currentUser?.location_id]);

  // Group messages by date
  const groupedMessages = groupMessagesByDate();
  const messagesByDate = Object.keys(groupedMessages).sort((a, b) => new Date(b) - new Date(a));

  // Handler for pinning/unpinning users
  const handleTogglePin = (user, e) => {
    // Stop the click from selecting the user
    e.stopPropagation();

    dispatch(togglePinUser({
      userId: user.id,
      isPinned: !user.pinned
    }));
  };

// Add this function to handle the deletion
const handleDeleteConversation = () => {
  if (!selectedUser || !currentUser) {
    console.log("No selected user or current user");
    return;
  }

  console.log("Selected user:", selectedUser);
  console.log("Current user:", currentUser);

  if (window.confirm(`Are you sure you want to delete all messages with ${selectedUser.name}?`)) {
    console.log(`Attempting to delete conversation between ${currentUser.id} and ${selectedUser.id}`);

    dispatch(deleteConversation({
      userId: selectedUser.id,
      currentUserId: currentUser.id
    }))
      .then((result) => {
        console.log("Delete conversation result:", result);
        // Close the menu
        setOptionsMenuOpen(false);

        // Clear the selected user to go back to the default view
        dispatch(clearSelectedUser());
      })
      .catch(error => {
        console.error("Error deleting conversation:", error);
        alert("Failed to delete conversation. Please try again.");
      });
  }
};



  // Add this right before the return statement
console.log("Rendering Communication Hub with:", {
  usersCount: users.length,
  messagesCount: allMessages.length,
  regularUsersCount: regularUsers.length,
  pinnedUsersCount: pinnedUsers.length,
  patientCheckInUsersCount: patientCheckInUsers.length,
  loading
});

  // Add this new log right after the one above
console.log("User filtering details:", {
  filteredUsers: filteredUsers.length,
  currentUserId: currentUser?.id,
  messageTypes: allMessages.length > 0 ? [...new Set(allMessages.map(msg => msg.type))] : [],
  messagesByUserCount: Object.entries(
    allMessages.reduce((acc, msg) => {
      const key = `${msg.sender_id}-${msg.receiver_id}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
});

  return (
    <div className="h-screen" style={{ backgroundColor: "#EBEAE6" }}>
      {/* Main App Sidebar - Fixed position */}
      <Sidebar />

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onCreateChat={handleCreateChat}
        allUsers={users}
        currentUserId={currentUser?.id}
      />

      {/* Main Content Area */}
      <div className="ml-20" style={{ backgroundColor: "#EBEAE6" }}>
        {/* Top Bar */}
        <TopBar />

              {/* System Alert Notification - Add it here */}
      {systemAlert && (
        <div className="fixed top-20 right-4 max-w-md bg-yellow-100 border-l-4 border-yellow-500 p-4 shadow-lg rounded-md z-50 animate-bounce">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{systemAlert.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setSystemAlert(null)}
                  className="inline-flex rounded-md p-1.5 text-yellow-500 hover:bg-yellow-200 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



{/* Custom Header for Communication Hub */}
<div className="px-4 pt-0 pb-2 ml-10">
  <h1 className="text-4xl font-bold text-gray-800">
    Communication Hub
  </h1>
</div>

        {/* Communication Hub Content */}
        <div className="p-6 mt-12 ml-10">
          <div className="flex space-x-4">
            {/* Left Panel - Chats List */}
            <div className="w-72 bg-white rounded-lg shadow overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-lg">Chats</h2>
                <button
                  className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                  onClick={() => setIsNewChatModalOpen(true)}
                >
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

              <div className="overflow-y-auto flex-1">
                {/* Pinned Chats Section */}
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 flex items-center">
                    <span className="mr-1">📌</span> Pinned Chats
                  </p>
                </div>

                {/* Pinned Chats */}
                <div className="px-2">
                  {loading ? (
                    <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                  ) : (
                    pinnedUsers.length > 0 ? (
                      pinnedUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer relative ${
                            selectedUser?.id === user.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleSelectUser(user, 'regular')}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                            {getUserInitials(user.name)}
                          </div>
                          <div className="ml-2 flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className={`font-medium text-sm truncate ${
  selectedUser?.id === user.id ? 'text-blue-600' : ''
} ${user.unread_count > 0 ? 'font-bold' : ''}`}>
  {user.name}
</p>
                              <span className="text-xs text-gray-500">
                                {user.last_message_time ? formatTime(user.last_message_time) : ''}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {(() => {
                                const userMessages = allMessages.filter(
                                  msg => (msg.sender_id === user.id && msg.receiver_id === currentUser.id) ||
                                         (msg.sender_id === currentUser.id && msg.receiver_id === user.id)
                                );
                                return userMessages.length > 0
                                  ? `${userMessages[0].message.substring(0, 30)}${userMessages[0].message.length > 30 ? '...' : ''}`
                                  : 'No messages';
                              })()}
                            </p>
{(() => {
  console.log("🔍 Rendered user unread count:", user.name, user.unread_count);
  return null;
})()}

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

                {/* Patient Check-ins Section */}
                <div className="px-3 py-2 mt-2">
                  <p className="text-xs font-semibold text-gray-500 flex items-center">
                    <span className="mr-1">👤</span> Patient Check-ins
                  </p>
                </div>

                {/* Patient Check-in Entry */}
                <div className="px-2">
                  {loading ? (
                    <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                  ) : (
                    patientCheckInSection()
                  )}
                </div>

                {/* Individual Patient Check-in Users (if needed) */}
                <div className="px-2">
                  {loading ? (
                    <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                  ) : (
                    patientCheckInUsers.length > 0 ? (
                      patientCheckInUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer relative ${
                            selectedUser?.id === user.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleSelectUser(user, 'patient-check-in')}
                        >
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium text-xs">
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
                              {(() => {
                                const userCheckInMessages = patientCheckIns.filter(
                                  msg => (msg.sender_id === user.id && msg.receiver_id === currentUser.id) ||
                                         (msg.sender_id === currentUser.id && msg.receiver_id === user.id)
                                );
                                return userCheckInMessages.length > 0
                                  ? `${userCheckInMessages[0].message.substring(0, 30)}${userCheckInMessages[0].message.length > 30 ? '...' : ''}`
                                  : 'Patient checked in';
                              })()}
                            </p>
                          </div>
                          {user.unread_count > 0 && (
                            <div className="ml-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                              {user.unread_count}
                            </div>
                          )}
                        </div>
                      ))
                    ) : null
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
                          onClick={() => handleSelectUser(user, 'regular')}
                        >
                         <div className="relative">
  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
    {getUserInitials(user.name)}
  </div>
                            {user.unread_count > 0 && (
                              <>
    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-400 rounded-full animate-ping opacity-75" />
                                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
                           </>
  )}
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
                              {(() => {
                                // Filter to only get general messages
                                const generalMessages = allMessages.filter(
                                  msg => ((msg.sender_id === user.id && msg.receiver_id === currentUser.id) ||
                                         (msg.sender_id === currentUser.id && msg.receiver_id === user.id)) &&
                                         (msg.type === 'general' || msg.type === null)
                                );

                                return generalMessages.length > 0
                                  ? `${generalMessages[0].message.substring(0, 30)}${generalMessages[0].message.length > 30 ? '...' : ''}`
                                  : 'No messages';
                              })()}
                            </p>
                          </div>


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
                  {selectedPatientCheckIns ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium text-xs">
                        🏥
                      </div>
                      <div className="ml-2">
                        <p className="font-medium">Patient Check-ins</p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Broadcast Messages
                        </span>
                      </div>
                    </>
                  ) : selectedUser ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                        {getUserInitials(selectedUser.name)}
                      </div>
                      <div className="ml-2">
                        <p className="font-medium">{selectedUser.name}</p>
                        {selectedUserContext === 'patient-check-in' ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Patient Check-in
                          </span>
                        ) : (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Recent Conversation
                          </span>
                        )}
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
  {selectedUser && (
    <div className="relative">
      <button
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
        aria-label="Message options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      </button>

      {optionsMenuOpen && (
        <div
          data-options-menu
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50"
        >
          <div className="py-1">
            <button
              onClick={handleDeleteConversation}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Delete Conversation
            </button>
            <button
              onClick={() => setOptionsMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )}
</div>

              </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-4">
  {loading ? (
    <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
  ) : selectedPatientCheckIns ? (
    // Display broadcast patient check-ins
    patientCheckIns.filter(msg => msg.receiver_id === null).map(checkIn => (
      <div key={checkIn.id} className="mb-4">
        <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-md">
{/* Add delete button if user sent this check-in */}
      {checkIn.sender_id === currentUser?.id && (
        <button
          className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteMessage(checkIn.id);
          }}
          title="Delete check-in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}


          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm">
              {checkIn.sender_name} <span className="text-xs text-gray-500">checked in a patient</span>
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(checkIn.created_at)}
            </span>
          </div>
          <p className="text-sm">{checkIn.message}</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          {formatDate(checkIn.created_at)}
        </div>
      </div>
    ))
  ) : !selectedUser ? (
    <div className="p-3 text-center text-sm text-gray-500">Select a user to view messages</div>
  ) : (localMessages.length === 0 && messages.length === 0) ? (
    <div className="p-3 text-center text-sm text-gray-500">No messages yet. Start a conversation!</div>
  ) : (
    // Create a combined messages array for grouping by date
   (() => {
  const combinedMessages =
    localMessages.length > 0
      ? [...localMessages, ...messages.filter(m => !localMessages.some(lm => lm.id === m.id))]
      : messages;

  // Group combined messages by date
  const combinedGroupedMessages = {};
  combinedMessages.forEach(message => {
    const date = new Date(message.created_at);
    const dateStr = date.toDateString();

    if (!combinedGroupedMessages[dateStr]) {
      combinedGroupedMessages[dateStr] = [];
    }

    combinedGroupedMessages[dateStr].push(message);
  });

  // 🔁 FIX 1: Sort messages within each date group from oldest to newest
  Object.keys(combinedGroupedMessages).forEach(date => {
    combinedGroupedMessages[date].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  });

  // 🔁 FIX 2: Sort date groups from oldest to newest
  const combinedMessagesByDate = Object.keys(combinedGroupedMessages)
    .sort((a, b) => new Date(a) - new Date(b));

  return combinedMessagesByDate.map(date => (
    <div key={date}>
      {/* Date Header */}
      <div className="py-2 px-4 text-center">
        <span className="text-xs text-gray-500">{formatDate(date)}</span>
      </div>

      {/* Messages for this date */}
      {combinedGroupedMessages[date]
        .filter(message => {
          if (selectedUserContext === 'patient-check-in') {
            return message.type === 'patient-check-in';
          } else if (selectedUserContext === 'regular') {
            return message.type === 'general' || message.type === null;
          }
          return true;
        })
        .map(message => {
          const isSentByMe = message.sender_id === currentUser?.id;
          const isPatientCheckIn = message.type === 'patient-check-in';
          const isTemporary = message.is_temporary;

          return (
            <div key={message.id}>
              <div className={`flex ${isSentByMe ? 'justify-end' : ''}`}>
                <div className={`relative max-w-xs lg:max-w-md rounded-lg ${
                  isSentByMe
                    ? isTemporary
                      ? 'bg-green-50'
                      : 'bg-green-100'
                    : isPatientCheckIn
                      ? 'bg-blue-100 border-l-4 border-green-500'
                      : 'bg-blue-100'
                } p-3 text-sm`}>

                  {/* Delete button (only for sender) */}
                  {isSentByMe && (
                    <button
                      className="absolute -top-6 right-0 bg-white bg-opacity-80 hover:bg-red-100 text-gray-500 hover:text-red-600 p-1 rounded-full shadow-sm z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(message.id);
                      }}
                      title="Delete message"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

                  <p>{message.message}</p>
                  {isTemporary && (
                    <div className="text-xs text-gray-400 mt-1">Sending...</div>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                {formatTime(message.created_at)}
              </div>
            </div>
          );
        })}
       {/* scroll feature */}
      <div ref={bottomRef} />
    </div>
  ));
})()
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
                    disabled={!selectedUser || selectedPatientCheckIns}
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-gray-300"
                    disabled={!selectedUser || selectedPatientCheckIns || !newMessageText.trim()}
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
    {(() => {
      const combined = [
        ...localMessages,
        ...messages.filter(m => !localMessages.some(lm => lm.id === m.id))
      ];

      // Log for debugging
      console.log("🧪 Raw combined messages:", combined);

      const validMessages = combined
        .filter(msg => {
          const isTypeMatch = selectedUserContext === 'patient-check-in'
            ? msg.type === 'patient-check-in'
            : msg.type === 'general' || msg.type === null || msg.type === undefined;

          const isValidDate = msg.created_at && !isNaN(new Date(msg.created_at));
          return isTypeMatch && isValidDate;
        })
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      const lastMsg = validMessages[validMessages.length - 1];

      console.log("🧪 Sorted + filtered lastMsg:", lastMsg);

      return lastMsg
        ? `${formatDate(lastMsg.created_at)}, "${lastMsg.message?.substring(0, 20)}${lastMsg.message?.length > 20 ? '...' : ''}"`
        : 'No messages yet';
    })()}
  </span>
</div>

{selectedUserContext === 'patient-check-in' && (
  <div className="flex items-start">
    <span className="text-gray-500 text-sm w-24">Status:</span>
    <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
      Patient Check-in
    </span>
  </div>
)}
                      </div>
                    </div>
                  </div>
                </>
              ) : selectedPatientCheckIns ? (
                <>
                  <div className="p-3 border-b flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium text-xs">
                      🏥
                    </div>
                    <div className="ml-2">
                      <p className="font-medium">Patient Check-ins</p>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">Broadcast System</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 text-center">
                    <p className="text-gray-600 mb-4">
                      This is the broadcast system for patient check-ins.
                    </p>
                    <p className="text-gray-600">
                      All patient check-ins created in the system will appear in this view for all staff members.
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>Select a user or patient check-ins to view details</p>
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

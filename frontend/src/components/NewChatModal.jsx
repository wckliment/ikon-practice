import React, { useState, useEffect } from 'react';

const NewChatModal = ({ isOpen, onClose, onCreateChat, allUsers, currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatType, setChatType] = useState('general'); // 'general' or 'patient-check-in'

  // Filter out current user and filter by search query
  const filteredUsers = allUsers
    .filter(user => user.id !== currentUserId)
    .filter(user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedUserId(null);
      setChatType('general');
    }
  }, [isOpen]);

  // Get user initials from name
  const getUserInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const handleCreateChat = () => {
    if (!selectedUserId) return;

    onCreateChat({
      userId: selectedUserId,
      type: chatType
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 shadow-xl overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Start New Chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chat Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-blue-600 mr-2"
                  checked={chatType === 'general'}
                  onChange={() => setChatType('general')}
                />
                <span className="text-sm">General</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-green-600 mr-2"
                  checked={chatType === 'patient-check-in'}
                  onChange={() => setChatType('patient-check-in')}
                />
                <span className="text-sm">Patient Check-in</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full p-2 border rounded-md text-sm mb-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="max-h-60 overflow-y-auto border rounded-md">
              {filteredUsers.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500">No users found</div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${
                      selectedUserId === user.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <div className={`w-8 h-8 rounded-full ${
                      chatType === 'patient-check-in' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    } flex items-center justify-center font-medium text-xs`}>
                      {getUserInitials(user.name)}
                    </div>
                    <div className="ml-2">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email || user.role || ''}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm text-gray-700 mr-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChat}
            className={`px-4 py-2 rounded-md text-sm text-white ${
              selectedUserId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!selectedUserId}
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;

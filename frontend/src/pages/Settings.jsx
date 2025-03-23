import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Users, Home, Key, Settings as SettingsIcon,
  Plus, Edit2, Trash2, Check, X, Copy
} from "react-feather";
import axios from "axios"; // Assuming you're using axios for API calls

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("keys");
  const [userRole, setUserRole] = useState("admin"); // Default to admin for development

  // State for user management
  const [users, setUsers] = useState([
    { id: 1, name: "Dr. John Doe", email: "john@ikonpractice.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@ikonpractice.com", role: "Dentist", status: "Active" },
    { id: 3, name: "Mike Johnson", email: "mike@ikonpractice.com", role: "Front Desk", status: "Invited" }
  ]);

  // State for practice information
  const [practiceInfo, setPracticeInfo] = useState({
    name: "Bright Smile Dental",
    address: "123 Main St, Suite 100",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    phone: "(415) 555-1234",
    taxId: "12-3456789",
    website: "www.brightsmile.com"
  });

  // State for locations
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: "Main Office",
      address: "123 Main St, Suite 100",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      phone: "(415) 555-1234",
      openDentalCustomerKey: "",
      openDentalDeveloperKey: ""
    },
    {
      id: 2,
      name: "Downtown Branch",
      address: "456 Market St",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      phone: "(415) 555-5678",
      openDentalCustomerKey: "",
      openDentalDeveloperKey: ""
    }
  ]);

  // State for API keys
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "Production API Key", key: "pk_live_12345abcde", type: "Production", created: "Jan 15, 2025" },
    { id: 2, name: "Test API Key", key: "pk_test_67890fghij", type: "Test", created: "Jan 10, 2025" }
  ]);

  // State for showing new user form
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Staff" });

  // State for editing practice info
  const [editingPractice, setEditingPractice] = useState(false);
  const [editedPractice, setEditedPractice] = useState({...practiceInfo});

  // State for editing location
  const [editingLocation, setEditingLocation] = useState(false);
  const [editedLocation, setEditedLocation] = useState(null);

  // State for OpenDental integration
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id || null);
  const [openDentalKeys, setOpenDentalKeys] = useState({
    customerKey: "",
    developerKey: ""
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'success', or 'error'

  // State for copied API key
  const [copiedKey, setCopiedKey] = useState(null);

  // Effect to load OpenDental keys for selected location
  useEffect(() => {
    if (selectedLocation) {
      const location = locations.find(loc => loc.id === selectedLocation);
      if (location) {
        setOpenDentalKeys({
          customerKey: location.openDentalCustomerKey || "",
          developerKey: location.openDentalDeveloperKey || ""
        });
      }
    }
  }, [selectedLocation, locations]);

  // Effect to set user role from Redux state
  useEffect(() => {
    if (user && user.role) {
      setUserRole(user.role.toLowerCase());
    }
  }, [user]);

  // Effect to clear copied key status after 2 seconds
  useEffect(() => {
    if (copiedKey) {
      const timer = setTimeout(() => {
        setCopiedKey(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [copiedKey]);

  // Tab access by role
  const roleTabAccess = {
    admin: ["users", "practice", "keys", "system"],
    owner: ["users", "practice", "keys", "system"],
    dentist: ["practice", "system"],
    hygienist: ["system"],
    staff: ["system"]
  };

  // Function to check if user has access to a tab
  const hasTabAccess = (tabId) => {
    if (!roleTabAccess[userRole]) return false;
    return roleTabAccess[userRole].includes(tabId);
  };

  // Effect to set initial active tab based on role
  useEffect(() => {
    // If user doesn't have access to the current tab, set to first accessible tab
    if (!hasTabAccess(activeTab) && roleTabAccess[userRole] && roleTabAccess[userRole].length > 0) {
      setActiveTab(roleTabAccess[userRole][0]);
    }
  }, [userRole, activeTab]);

  // Handler for inviting new user
  const handleInviteUser = () => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, {...newUser, id: newId, status: "Invited"}]);
    setNewUser({ name: "", email: "", role: "Staff" });
    setShowNewUserForm(false);
  };

  // Handler for updating practice info
  const handleUpdatePractice = () => {
    setPracticeInfo(editedPractice);
    setEditingPractice(false);

    // Here you would make an API call to update the practice information
    // Example: axios.put('/api/practice', editedPractice);
  };

  // Handler for editing location
  const handleEditLocation = (location) => {
    setEditedLocation({...location});
    setEditingLocation(true);
  };

  // Handler for updating location
  const handleUpdateLocation = () => {
    const updatedLocations = locations.map(loc =>
      loc.id === editedLocation.id ? editedLocation : loc
    );
    setLocations(updatedLocations);
    setEditingLocation(false);

    // Here you would make an API call to update the location
    // Example: axios.put(`/api/locations/${editedLocation.id}`, editedLocation);
  };

  // Handler for generating new API key
  const handleGenerateKey = (type) => {
    const newId = apiKeys.length > 0 ? Math.max(...apiKeys.map(k => k.id)) + 1 : 1;
    const newKey = {
      id: newId,
      name: `${type} API Key`,
      key: `pk_${type.toLowerCase()}_${Math.random().toString(36).substring(2, 12)}`,
      type: type,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setApiKeys([...apiKeys, newKey]);

    // Here you would make an API call to create the new API key
    // Example: axios.post('/api/apikeys', newKey);
  };

  // Handler for copying API key to clipboard
  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(key);
    });
  };

  // Handler for revoking API key
  const handleRevokeKey = (keyId) => {
    const updatedKeys = apiKeys.filter(key => key.id !== keyId);
    setApiKeys(updatedKeys);

    // Here you would make an API call to revoke the API key
    // Example: axios.delete(`/api/apikeys/${keyId}`);
  };

  // Handler for testing OpenDental connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      // This is where you would make an actual API call to test the connection
      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate a successful connection
      setConnectionStatus('success');

      // Update the location with the new keys
      const updatedLocations = locations.map(loc => {
        if (loc.id === selectedLocation) {
          return {
            ...loc,
            openDentalCustomerKey: openDentalKeys.customerKey,
            openDentalDeveloperKey: openDentalKeys.developerKey
          };
        }
        return loc;
      });

      setLocations(updatedLocations);

      // In a real implementation, you would make an API call to update the database
      // Example: await axios.put(`/api/locations/${selectedLocation}/opendentalkeys`, openDentalKeys);
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  // Common button styles
  const buttonStyle = "px-4 py-2 rounded-lg font-medium transition duration-300";
  const primaryButtonStyle = `${buttonStyle} bg-blue-600 text-white hover:bg-blue-700`;
  const secondaryButtonStyle = `${buttonStyle} border border-gray-300 text-gray-700 hover:bg-gray-100`;
  const dangerButtonStyle = `${buttonStyle} bg-red-600 text-white hover:bg-red-700`;

  // Icon style to match sidebar
  const iconStyle = {
    strokeWidth: 1.25,
  };

  return (
    <div className="p-8 ml-24 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Admin Notice for non-admin users */}
      {userRole !== 'admin' && userRole !== 'owner' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Some settings options are only available to practice administrators and owners.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-8 overflow-x-auto">
        {hasTabAccess("users") && (
          <button
            className={`flex items-center ${activeTab === "users" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} pb-3 mr-8 transition duration-300`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={20} style={iconStyle} className="mr-2" />
            <span className="font-medium">Users & Permissions</span>
          </button>
        )}

        {hasTabAccess("practice") && (
          <button
            className={`flex items-center ${activeTab === "practice" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} pb-3 mr-8 transition duration-300`}
            onClick={() => setActiveTab("practice")}
          >
            <Home size={20} style={iconStyle} className="mr-2" />
            <span className="font-medium">Practice Information</span>
          </button>
        )}

        {hasTabAccess("keys") && (
          <button
            className={`flex items-center ${activeTab === "keys" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} pb-3 mr-8 transition duration-300`}
            onClick={() => setActiveTab("keys")}
          >
            <Key size={20} style={iconStyle} className="mr-2" />
            <span className="font-medium">API & Integration</span>
          </button>
        )}

        {hasTabAccess("system") && (
          <button
            className={`flex items-center ${activeTab === "system" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"} pb-3 transition duration-300`}
            onClick={() => setActiveTab("system")}
          >
            <SettingsIcon size={20} style={iconStyle} className="mr-2" />
            <span className="font-medium">System Preferences</span>
          </button>
        )}
      </div>

      {/* Users & Permissions Tab */}
      {activeTab === "users" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <button
              className={`${primaryButtonStyle} flex items-center`}
              onClick={() => setShowNewUserForm(true)}
            >
              <Plus size={16} className="mr-1" />
              Invite User
            </button>
          </div>

          {/* New User Form */}
          {showNewUserForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Invite New Team Member</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                    <option value="Dentist">Dentist</option>
                    <option value="Hygienist">Hygienist</option>
                    <option value="Front Desk">Front Desk</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className={secondaryButtonStyle}
                  onClick={() => setShowNewUserForm(false)}
                >
                  Cancel
                </button>
                <button
                  className={primaryButtonStyle}
                  onClick={handleInviteUser}
                >
                  Send Invitation
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Practice Information Tab */}
      {activeTab === "practice" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Practice Details</h2>
            {!editingPractice && (
              <button
                className={`${secondaryButtonStyle} flex items-center`}
                onClick={() => {
                  setEditedPractice({...practiceInfo});
                  setEditingPractice(true);
                }}
              >
                <Edit2 size={16} className="mr-1" />
                Edit Information
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            {!editingPractice ? (
              // Display mode
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Practice Name</h3>
                  <p className="text-base">{practiceInfo.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                  <p className="text-base">{practiceInfo.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                  <p className="text-base">{practiceInfo.address}</p>
                  <p className="text-base">{practiceInfo.city}, {practiceInfo.state} {practiceInfo.zip}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Website</h3>
                  <p className="text-base">{practiceInfo.website}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Tax ID / EIN</h3>
                  <p className="text-base">{practiceInfo.taxId}</p>
                </div>
              </div>
            ) : (
              // Edit mode
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Practice Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editedPractice.name}
                      onChange={(e) => setEditedPractice({...editedPractice, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editedPractice.phone}
                      onChange={(e) => setEditedPractice({...editedPractice, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editedPractice.address}
                      onChange={(e) => setEditedPractice({...editedPractice, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editedPractice.city}
                      onChange={(e) => setEditedPractice({...editedPractice, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editedPractice.state}
                      onChange={(e) => setEditedPractice({...editedPractice, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editedPractice.zip}
                      onChange={(e) => setEditedPractice({...editedPractice, zip: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editedPractice.website}
                      onChange={(e) => setEditedPractice({...editedPractice, website: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / EIN</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editedPractice.taxId}
                      onChange={(e) => setEditedPractice({...editedPractice, taxId: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    className={secondaryButtonStyle}
                    onClick={() => setEditingPractice(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={primaryButtonStyle}
                    onClick={handleUpdatePractice}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Locations Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Practice Locations</h2>
              <button className={`${primaryButtonStyle} flex items-center`}>
                <Plus size={16} className="mr-1" />
                Add Location
              </button>
            </div>

            {/* Locations List */}
            <div className="space-y-4">
              {locations.map(location => (
                <div key={location.id} className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{location.name}</h3>
                      <p className="text-gray-600 mt-1">{location.address}, {location.city}, {location.state} {location.zip}</p>
                      <p className="text-gray-600 mt-1">{location.phone}</p>
                    </div>
                    <div className="flex">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                        onClick={() => handleEditLocation(location)}
                      >
                        <Edit2 size={16} className="mr-1" />
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900 flex items-center">
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Location Modal */}
            {editingLocation && editedLocation && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-3/4 max-w-3xl">
                  <h3 className="text-lg font-medium mb-4">Edit Location</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={editedLocation.name}
                        onChange={(e) => setEditedLocation({...editedLocation, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={editedLocation.phone}
                        onChange={(e) => setEditedLocation({...editedLocation, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={editedLocation.address}
                        onChange={(e) => setEditedLocation({...editedLocation, address: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={editedLocation.city}
                        onChange={(e) => setEditedLocation({...editedLocation, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={editedLocation.state}
                        onChange={(e) => setEditedLocation({...editedLocation, state: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={editedLocation.zip}
                        onChange={(e) => setEditedLocation({...editedLocation, zip: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      className={secondaryButtonStyle}
                      onClick={() => setEditingLocation(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className={primaryButtonStyle}
                      onClick={handleUpdateLocation}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API & Integration Tab */}
      {activeTab === "keys" && (
        <div>
          {/* OpenDental Integration Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-6">OpenDental Integration</h2>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                <p className="mb-3 text-gray-600">
                  Connect your practice to OpenDental by entering your customer key and developer key.
                  These keys can be generated from your OpenDental software.
                </p>
                <a
                  href="https://www.opendental.com/site/apikeyguideline.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  How to generate OpenDental API keys
                </a>
              </div>

              {/* Location Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Practice Location</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(Number(e.target.value))}
                >
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.address}, {location.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key Input Fields */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Key</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={openDentalKeys.customerKey}
                    onChange={(e) => setOpenDentalKeys({...openDentalKeys, customerKey: e.target.value})}
                    placeholder="Enter your OpenDental Customer Key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Developer Key</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={openDentalKeys.developerKey}
                    onChange={(e) => setOpenDentalKeys({...openDentalKeys, developerKey: e.target.value})}
                    placeholder="Enter your OpenDental Developer Key"
                  />
                </div>
              </div>

              {/* Connection Status and Test Button */}
              <div className="flex items-center justify-between">
                <div>
                  {connectionStatus === 'success' && (
                    <div className="flex items-center text-green-600">
                      <Check size={18} className="mr-1" />
                      <span>Connection successful! Keys saved.</span>
                    </div>
                  )}
                  {connectionStatus === 'error' && (
                    <div className="flex items-center text-red-600">
                      <X size={18} className="mr-1" />
                      <span>Connection failed. Please check your keys and try again.</span>
                    </div>
                  )}
                </div>
                <button
                  className={testingConnection ? `${secondaryButtonStyle} opacity-75 cursor-not-allowed` : primaryButtonStyle}
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? 'Testing Connection...' : 'Test & Save Connection'}
                </button>
              </div>
            </div>
          </div>

          {/* API Keys Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">ikon Practice API Keys</h2>
              <div className="flex space-x-3">
                <button
                  className={secondaryButtonStyle}
                  onClick={() => handleGenerateKey("Test")}
                >
                  Generate Test Key
                </button>
                <button
                  className={primaryButtonStyle}
                  onClick={() => handleGenerateKey("Production")}
                >
                  Generate Production Key
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  API keys allow third-party applications to access your practice data securely.
                  Never share your production keys with unauthorized individuals.
                </p>
              </div>
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{apiKey.key}</code>
                          <button
                            className="ml-2 text-gray-500 hover:text-gray-700"
                            onClick={() => handleCopyKey(apiKey.key)}
                            title="Copy to clipboard"
                          >
                            {copiedKey === apiKey.key ? (
                              <Check size={16} className="text-green-500" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${apiKey.type === 'Production' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {apiKey.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{apiKey.created}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-red-600 hover:text-red-900 flex items-center ml-auto"
                          onClick={() => handleRevokeKey(apiKey.id)}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* System Preferences Tab */}
      {activeTab === "system" && (
        <div>
          <h2 className="text-xl font-semibold mb-6">System Preferences</h2>

          {/* Appearance Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Appearance</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System Default</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dashboard Layout</label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>Standard</option>
                  <option>Compact</option>
                  <option>Expanded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Operational Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium mb-4">Operational Settings</h3>

            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Business Hours</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>8:00 AM</option>
                    <option>8:30 AM</option>
                    <option>9:00 AM</option>
                    <option>9:30 AM</option>
                    <option>10:00 AM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>4:00 PM</option>
                    <option>4:30 PM</option>
                    <option>5:00 PM</option>
                    <option>5:30 PM</option>
                    <option>6:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">Appointment Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Default Appointment Duration</h5>
                    <p className="text-sm text-gray-500">Standard time slot for new appointments</p>
                  </div>
                  <select className="p-2 border border-gray-300 rounded-md w-24">
                    <option>15 min</option>
                    <option>30 min</option>
                    <option>45 min</option>
                    <option>60 min</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Booking Notice</h5>
                    <p className="text-sm text-gray-500">Minimum time before an appointment can be booked</p>
                  </div>
                  <select className="p-2 border border-gray-300 rounded-md w-32">
                    <option>No notice</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>24 hours</option>
                    <option>48 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Allow Online Booking</h5>
                    <p className="text-sm text-gray-500">Let patients book appointments online</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" defaultChecked />
                      <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform translate-x-6"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

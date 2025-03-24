import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Users, Home, Key, Settings as SettingsIcon,
  Plus, Edit2, Trash2, Check, X, Copy
} from "react-feather";
import {
  fetchUsers,
  fetchUsersByLocation,
  fetchLocations,
  inviteUser,
  updateUserLocation,
  updateLocation,
  updateOpenDentalKeys,
  generateApiKey,
  revokeApiKey,
  updateSystemPreferences
} from "../redux/settingsSlice";

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
const { data: users = [], status: usersStatus, error: usersError } = useSelector((state) => state.settings.users);
const { data: usersByLocation = [], status: usersByLocationStatus } = useSelector((state) => state.settings.usersByLocation);
  const { data: locations = [], status: locationsStatus } = useSelector((state) => state.settings.locations);
  const { data: apiKeys, status: apiKeysStatus } = useSelector((state) => state.settings.apiKeys);
    const systemPreferences = useSelector((state) => state.settings.systemPreferences);

     // Add these console logs here
  console.log("Users from Redux:", users);
  console.log("User status:", usersStatus);
  console.log("Locations from Redux:", locations);
  console.log("API Keys from Redux:", apiKeys);

  const [activeTab, setActiveTab] = useState("keys");
  const [userRole, setUserRole] = useState("admin"); // Default to admin for development

  // State for showing new user form
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "staff", location_id: null });

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

  // State for editing practice info
  const [editingPractice, setEditingPractice] = useState(false);
  const [editedPractice, setEditedPractice] = useState({...practiceInfo});

  // State for editing location
  const [editingLocation, setEditingLocation] = useState(false);
  const [editedLocation, setEditedLocation] = useState(null);

  // State for location filtering (users table)
  const [selectedLocationFilter, setSelectedLocationFilter] = useState(null);

  // State for OpenDental integration
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [openDentalKeys, setOpenDentalKeys] = useState({
    customerKey: "",
    developerKey: ""
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'success', or 'error'

  // State for copied API key
  const [copiedKey, setCopiedKey] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchLocations());
  }, [dispatch]);

  // Fetch users by location when filter changes
  useEffect(() => {
    if (selectedLocationFilter) {
      dispatch(fetchUsersByLocation(selectedLocationFilter));
    }
  }, [dispatch, selectedLocationFilter]);

  // Effect to load OpenDental keys for selected location
  useEffect(() => {
    if (selectedLocation && locations.length > 0) {
      const location = locations.find(loc => loc.id === selectedLocation);
      if (location) {
        setOpenDentalKeys({
          customerKey: location.customer_key || "",
          developerKey: location.developer_key || ""
        });
      }
    }
  }, [selectedLocation, locations]);

  // Set initial selected location when locations are loaded
  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0].id);
    }
  }, [locations, selectedLocation]);

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
  const handleInviteUser = async () => {
    try {
      // Ensure location_id is included
      const userData = {
        ...newUser,
        location_id: selectedLocationFilter || null
      };

      await dispatch(inviteUser(userData)).unwrap();
      setNewUser({ name: "", email: "", role: "staff", location_id: null });
      setShowNewUserForm(false);

      // Refresh the user list
      if (selectedLocationFilter) {
        dispatch(fetchUsersByLocation(selectedLocationFilter));
      } else {
        dispatch(fetchUsers());
      }
    } catch (error) {
      console.error("Failed to invite user:", error);
      // You could add error state here to show an error message
    }
  };

  // Handler for updating practice info
  const handleUpdatePractice = () => {
    setPracticeInfo(editedPractice);
    setEditingPractice(false);

    // Here you would make an API call to update the practice information
    // Example: dispatch(updatePracticeInfo(editedPractice));
  };

  // Handler for editing location
  const handleEditLocation = (location) => {
    setEditedLocation({...location});
    setEditingLocation(true);
  };

  // Handler for updating location
  const handleUpdateLocation = async () => {
    try {
      await dispatch(updateLocation({ id: editedLocation.id, locationData: editedLocation })).unwrap();
      setEditingLocation(false);
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  // Handler for generating new API key
  const handleGenerateKey = async (type) => {
    try {
      await dispatch(generateApiKey(type)).unwrap();
    } catch (error) {
      console.error("Failed to generate API key:", error);
    }
  };

  // Handler for copying API key to clipboard
  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(key);
    });
  };

  // Handler for revoking API key
  const handleRevokeKey = async (keyId) => {
    try {
      await dispatch(revokeApiKey(keyId)).unwrap();
    } catch (error) {
      console.error("Failed to revoke API key:", error);
    }
  };

  // Handler for testing OpenDental connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      await dispatch(updateOpenDentalKeys({
        locationId: selectedLocation,
        customerKey: openDentalKeys.customerKey,
        developerKey: openDentalKeys.developerKey
      })).unwrap();

      setConnectionStatus('success');
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

  // Get users to display based on location filter
  const displayUsers = selectedLocationFilter ? usersByLocation : users;
  const isLoadingUsers = selectedLocationFilter ? usersByLocationStatus === 'loading' : usersStatus === 'loading';

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

          {/* Location Filter */}
        {locationsStatus === 'succeeded' && Array.isArray(locations) && locations.length > 0 && (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Location</label>
    <select
      className="w-full p-2 border border-gray-300 rounded-md"
      value={selectedLocationFilter || ''}
      onChange={(e) => setSelectedLocationFilter(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">All Locations</option>
      {locations.map((location) => (
        <option key={location.id} value={location.id}>
          {location.name}
        </option>
      ))}
    </select>
  </div>
)}

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
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                    <option value="dentist">Dentist</option>
                    <option value="hygienist">Hygienist</option>
                    <option value="front desk">Front Desk</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
  <select
    className="w-full p-2 border border-gray-300 rounded-md"
    value={newUser.location_id || ''}
    onChange={(e) => setNewUser({...newUser, location_id: e.target.value ? Number(e.target.value) : null})}
    disabled={locationsStatus !== 'succeeded' || !Array.isArray(locations) || locations.length === 0}
  >
    <option value="">No Location</option>
    {Array.isArray(locations) && locations.length > 0 && locations.map((location) => (
      <option key={location.id} value={location.id}>
        {location.name}
      </option>
    ))}
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
            {isLoadingUsers ? (
              <div className="p-6 text-center">Loading users...</div>
            ) : usersError ? (
              <div className="p-6 text-center text-red-500">Error: {usersError}</div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
               <tbody className="divide-y divide-gray-200">
  {Array.isArray(displayUsers) && displayUsers.length > 0 ? (
    displayUsers.map((user) => (
      <tr key={user.id}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">{user.name}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{user.email}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500 capitalize">{user.role}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{user.location_name || 'No Location'}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
          <button className="text-red-600 hover:text-red-900">Remove</button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
        No users found{selectedLocationFilter ? " for this location" : ""}.
      </td>
    </tr>
  )}
</tbody>
              </table>
            )}
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

            {/* Locations Loading State */}
            {locationsStatus === 'loading' && (
              <div className="text-center p-6">Loading locations...</div>
            )}

            {/* Locations Error State */}
            {locationsStatus === 'failed' && (
              <div className="text-center p-6 text-red-500">
                Failed to load locations. Please try again.
              </div>
            )}

            {/* Locations List */}
            {locationsStatus === 'succeeded' && (
              <div className="space-y-4">
                {locations.length > 0 ? (
                  locations.map(location => (
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
                  ))
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    No locations found. Add your first location to get started.
                  </div>
                )}
              </div>
            )}

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
          <div className="text-blue-600 hover:text-blue-800">
            <a
              href="https://www.opendental.com/site/apikeyguideline.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              How to generate OpenDental API keys
            </a>
          </div>
        </div>

           {/* Location Selector */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">Select Practice Location</label>
  {locationsStatus === 'loading' ? (
    <div className="text-sm text-gray-500">Loading locations...</div>
  ) : locationsStatus === 'failed' ? (
    <div className="text-sm text-red-500">Failed to load locations</div>
  ) : !locations || !Array.isArray(locations) || locations.length === 0 ? (
    <div className="text-sm text-gray-500">No locations available. Please add a location first.</div>
  ) : (
    <select
      className="w-full p-2 border border-gray-300 rounded-md"
      value={selectedLocation || ''}
      onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="" disabled>Select a location</option>
      {locations.map(location => (
        <option key={location.id} value={location.id}>
          {location.name} - {location.address}, {location.city}
        </option>
      ))}
    </select>
  )}
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
                    disabled={!selectedLocation}
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
                    disabled={!selectedLocation}
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
                  className={(!selectedLocation || testingConnection) ? `${secondaryButtonStyle} opacity-75 cursor-not-allowed` : primaryButtonStyle}
                  onClick={handleTestConnection}
                  disabled={!selectedLocation || testingConnection}
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

              {apiKeysStatus === 'loading' ? (
                <div className="p-6 text-center">Loading API keys...</div>
              ) : apiKeysStatus === 'failed' ? (
                <div className="p-6 text-center text-red-500">Failed to load API keys</div>
              ) : apiKeys && apiKeys.length > 0 ? (
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
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No API keys found. Generate a key to get started.
                </div>
              )}
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
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={systemPreferences.theme}
                  onChange={(e) => dispatch(updateSystemPreferences({ theme: e.target.value }))}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dashboard Layout</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={systemPreferences.dashboardLayout}
                  onChange={(e) => dispatch(updateSystemPreferences({ dashboardLayout: e.target.value }))}
                >
                  <option value="standard">Standard</option>
                  <option value="compact">Compact</option>
                  <option value="expanded">Expanded</option>
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
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={systemPreferences.businessHours.open}
                    onChange={(e) => dispatch(updateSystemPreferences({
                      businessHours: { ...systemPreferences.businessHours, open: e.target.value }
                    }))}
                  >
                    <option>8:00 AM</option>
                    <option>8:30 AM</option>
                    <option>9:00 AM</option>
                    <option>9:30 AM</option>
                    <option>10:00 AM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={systemPreferences.businessHours.close}
                    onChange={(e) => dispatch(updateSystemPreferences({
                      businessHours: { ...systemPreferences.businessHours, close: e.target.value }
                    }))}
                  >
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
                  <select
                    className="p-2 border border-gray-300 rounded-md w-24"
                    value={systemPreferences.appointmentSettings.defaultDuration}
                    onChange={(e) => dispatch(updateSystemPreferences({
                      appointmentSettings: {
                        ...systemPreferences.appointmentSettings,
                        defaultDuration: Number(e.target.value)
                      }
                    }))}
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Booking Notice</h5>
                    <p className="text-sm text-gray-500">Minimum time before an appointment can be booked</p>
                  </div>
                  <select
                    className="p-2 border border-gray-300 rounded-md w-32"
                    value={systemPreferences.appointmentSettings.bookingNotice}
                    onChange={(e) => dispatch(updateSystemPreferences({
                      appointmentSettings: {
                        ...systemPreferences.appointmentSettings,
                        bookingNotice: Number(e.target.value)
                      }
                    }))}
                  >
                    <option value="0">No notice</option>
                    <option value="1">1 hour</option>
                    <option value="4">4 hours</option>
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">Allow Online Booking</h5>
                    <p className="text-sm text-gray-500">Let patients book appointments online</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={systemPreferences.appointmentSettings.allowOnlineBooking}
                        onChange={(e) => dispatch(updateSystemPreferences({
                          appointmentSettings: {
                            ...systemPreferences.appointmentSettings,
                            allowOnlineBooking: e.target.checked
                          }
                        }))}
                      />
                      <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${
                        systemPreferences.appointmentSettings.allowOnlineBooking ? 'translate-x-6' : ''
                      }`}></div>
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

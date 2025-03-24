import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Debug = () => {
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    const testApiEndpoints = async () => {
      console.log("Testing API endpoints with token:", auth.token);

      try {
        // Test users endpoint
        console.log("Testing /api/users endpoint...");
        const usersResponse = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        console.log("Users endpoint success:", usersResponse.data);
      } catch (error) {
        console.error("Users endpoint error:", error);
        console.log("Error response:", error.response);
        console.log("Error status:", error.response?.status);
        console.log("Error data:", error.response?.data);
      }

      try {
        // Test locations endpoint
        console.log("Testing /api/locations endpoint...");
        const locationsResponse = await axios.get('/api/locations', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        console.log("Locations endpoint success:", locationsResponse.data);
      } catch (error) {
        console.error("Locations endpoint error:", error);
        console.log("Error response:", error.response);
        console.log("Error status:", error.response?.status);
        console.log("Error data:", error.response?.data);
      }
    };

    if (auth.token) {
      testApiEndpoints();
    }
  }, [auth.token]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', backgroundColor: '#f9f9f9' }}>
      <h3>Auth Debug Info</h3>
      <p><strong>Authenticated:</strong> {auth.isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>Token Present:</strong> {auth.token ? 'Yes' : 'No'}</p>
      {auth.user && (
        <div>
          <p><strong>User ID:</strong> {auth.user.id}</p>
          <p><strong>User Role:</strong> {auth.user.role}</p>
        </div>
      )}
    </div>
  );
};

export default Debug;

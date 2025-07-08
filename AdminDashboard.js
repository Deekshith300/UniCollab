import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState("");
  const [deleting, setDeleting] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Role updated");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdating("");
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user and all their content?")) return;
    setDeleting(userId);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("User deleted");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting("");
      setTimeout(() => setSuccess(""), 2000);
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container" style={{paddingBottom: '2.5rem'}}>
      <h2>Admin Dashboard</h2>
      <div className="admin-actions">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>
      {loading ? (
        <div className="loading-container"><div className="loading-spinner"></div>Loading users...</div>
      ) : error ? (
        <div className="message error">{error}</div>
      ) : (
        <div className="glass-card animate-fade-in">
          <div className="section-divider"></div>
          <h2 className="section-heading">Users</h2>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} className="animate-fade-in user-row">
                    <td>{user.name}</td>
                    <td>@{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user._id, e.target.value)}
                        disabled={updating === user._id}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{user.department || "-"}</td>
                    <td>{user.year || "-"}</td>
                    <td>
                      <button
                        className="delete-btn glass-button"
                        onClick={() => handleDelete(user._id)}
                        disabled={deleting === user._id}
                        style={{margin: '0 0.5rem'}}
                      >
                        {deleting === user._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {success && <div className="message success">{success}</div>}
    </div>
  );
}

export default AdminDashboard; 
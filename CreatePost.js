import React, { useState } from 'react';
import './CreatePost.css';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (!file) return;
    setUploading(true);
    setMessage('Uploading image...');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('http://localhost:5000/api/upload-post-image', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        setMessage('Image uploaded!');
      } else {
        setMessage('Image upload failed.');
      }
    } catch (err) {
      setMessage('Image upload failed.');
    }
    setUploading(false);
  };

  const validate = () => {
    const errs = {};
    if (!title) errs.title = "Title is required.";
    if (!content) errs.content = "Content is required.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setCreating(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/posts",
        { title, content },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage(response.data.message || 'Post created successfully!');
      setTitle('');
      setContent('');
      if (onPostCreated) onPostCreated();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create post. Please try again later.");
    }
    setCreating(false);
  };

  return (
    <div className="create-post-container">
      <h2>Create Post</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? "input-error" : ""}
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>
        <div className="form-group">
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={errors.content ? "input-error" : ""}
          />
          {errors.content && <div className="form-error">{errors.content}</div>}
        </div>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" />
        {imageUrl && <img src={imageUrl} alt="Preview" style={{ width: 120 }} />}
        <button type="submit" disabled={uploading || creating}>{creating ? 'Posting...' : 'Create Post'}</button>
      </form>
    </div>
  );
};

export default CreatePost; 
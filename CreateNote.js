import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CreateNote.css';

const CreateNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    isPublic: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const categories = [
    'Study Notes',
    'Lecture Notes',
    'Assignment Notes',
    'Research Notes',
    'Personal Notes',
    'Project Notes',
    'Exam Preparation',
    'General'
  ];

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const note = data.note;
        setFormData({
          title: note.title || '',
          content: note.content || '',
          category: note.category || '',
          tags: note.tags ? note.tags.join(', ') : '',
          isPublic: note.isPublic || false
        });
      }
    } catch (err) {
      setError('Failed to fetch note');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      if (response.ok) {
        setMessage("Note created successfully!");
        setTitle("");
        setContent("");
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to create note. Please try again later.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create note. Please try again later.");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/notes');
  };

  return (
    <div className="create-note-bg">
      <div className="create-note-container">
        <div className="create-note-header">
          <h1>{isEditing ? 'Edit Note' : 'Create New Note'}</h1>
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="note-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              required
              className={errors.title ? "input-error" : "form-input"}
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Enter tags separated by commas..."
              className="form-input"
            />
            <small className="form-help">
              Separate tags with commas (e.g., math, algebra, equations)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here... You can use basic HTML tags like &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;h1&gt;, &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;code&gt;, &lt;pre&gt;, &lt;blockquote&gt;"
              required
              rows="15"
              className={errors.content ? "input-error" : "form-textarea"}
            />
            {errors.content && <div className="form-error">{errors.content}</div>}
            <small className="form-help">
              You can use basic HTML tags for formatting. Examples:
              <br />
              &lt;b&gt;bold text&lt;/b&gt;, &lt;i&gt;italic text&lt;/i&gt;, &lt;u&gt;underlined text&lt;/u&gt;
              <br />
              &lt;h1&gt;Heading 1&lt;/h1&gt;, &lt;h2&gt;Heading 2&lt;/h2&gt;
              <br />
              &lt;ul&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ul&gt;, &lt;ol&gt;&lt;li&gt;Numbered item&lt;/li&gt;&lt;/ol&gt;
              <br />
              &lt;code&gt;code snippet&lt;/code&gt;, &lt;pre&gt;preformatted text&lt;/pre&gt;
            </small>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="form-checkbox"
              />
              <span className="checkbox-text">Make this note public</span>
            </label>
            <small className="form-help">
              Public notes can be viewed by other users
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Note' : 'Create Note')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNote; 
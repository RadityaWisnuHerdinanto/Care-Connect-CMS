import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default function ActivityDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteNewsModal, setShowDeleteNewsModal] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState(null);
    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [showNewsModal, setShowNewsModal] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [newsForm, setNewsForm] = useState({ title: "", content: "", images: [] });
    const [showImageModal, setShowImageModal] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState("");

    const base = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        setIsLoggedIn(!!token);
        fetchActivity();
        fetchNews();
    }, [id]);

    const fetchActivity = async () => {
        try {
            const res = await axios.get(`${base}/api/activities/${id}`);
            setActivity(res.data.data || res.data);
        } catch (err) {
            console.error("Failed to fetch activity:", err);
            setError("Failed to load activity details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("access_token");
            await axios.delete(`${base}/api/activities/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Toastify({
                text: "Activity deleted successfully!",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: {
                    background: "#10b981",
                },
            }).showToast();
            setShowDeleteModal(false);
            navigate("/");
        } catch (err) {
            console.error("Failed to delete activity:", err);
            console.error("Error response:", err?.response?.data);
            Toastify({
                text: err?.response?.data?.message || err?.response?.data?.error || "Failed to delete activity. Please try again.",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: {
                    background: "#ef4444",
                },
            }).showToast();
            setShowDeleteModal(false);
        }
    };

    const fetchNews = async () => {
        try {
            const res = await axios.get(`${base}/api/news/activity/${id}`);
            setNews(res.data.data || res.data || []);
        } catch (err) {
            console.error("Failed to fetch news:", err);
        } finally {
            setNewsLoading(false);
        }
    };

    const handleNewsSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("access_token");
            if (editingNews) {
                // Update existing news - hanya kirim title, content, images
                await axios.put(
                    `${base}/api/news/${editingNews._id}`,
                    { 
                        title: newsForm.title,
                        content: newsForm.content,
                        images: newsForm.images
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                Toastify({
                    text: "News updated successfully!",
                    duration: 2000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#10b981" },
                }).showToast();
            } else {
                // Create new news - kirim dengan activityId
                await axios.post(
                    `${base}/api/news`,
                    { 
                        title: newsForm.title,
                        content: newsForm.content,
                        images: newsForm.images,
                        activityId: id 
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                Toastify({
                    text: "News created successfully!",
                    duration: 2000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#10b981" },
                }).showToast();
            }
            setShowNewsModal(false);
            setNewsForm({ title: "", content: "" });
            setEditingNews(null);
            fetchNews();
        } catch (err) {
            console.error("Failed to save news:", err);
            Toastify({
                text: err?.response?.data?.message || "Failed to save news. Please try again.",
                duration: 2000,
                gravity: "top",
                position: "right",
                style: { background: "#ef4444" },
            }).showToast();
        }
    };

    const handleDeleteNews = async (newsId) => {
        setNewsToDelete(newsId);
        setShowDeleteNewsModal(true);
    };

    const confirmDeleteNews = async () => {
        try {
            const token = localStorage.getItem("access_token");
            await axios.delete(`${base}/api/news/${newsToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Toastify({
                text: "News deleted successfully!",
                duration: 2000,
                gravity: "top",
                position: "right",
                style: { background: "#10b981" },
            }).showToast();
            setShowDeleteNewsModal(false);
            setNewsToDelete(null);
            fetchNews();
        } catch (err) {
            console.error("Failed to delete news:", err);
            Toastify({
                text: err?.response?.data?.message || "Failed to delete news.",
                duration: 2000,
                gravity: "top",
                position: "right",
                style: { background: "#ef4444" },
            }).showToast();
            setShowDeleteNewsModal(false);
            setNewsToDelete(null);
        }
    };

    const handleEditNews = (newsItem) => {
        setEditingNews(newsItem);
        setNewsForm({ 
            title: newsItem.title, 
            content: newsItem.content,
            images: newsItem.images || []
        });
        setShowNewsModal(true);
    };

    const handleAddNews = () => {
        setEditingNews(null);
        setNewsForm({ title: "", content: "", images: [] });
        setShowNewsModal(true);
    };

    const handleImageAdd = () => {
        if (newImageUrl.trim()) {
            setNewsForm(prev => ({
                ...prev,
                images: [...prev.images, newImageUrl.trim()]
            }));
            setNewImageUrl("");
            setShowImageModal(false);
        }
    };

    const handleImageRemove = (index) => {
        setNewsForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <div style={styles.centered}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading activity...</p>
            </div>
        );
    }

    if (error || !activity) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.headerContent}>
                        <h1 style={styles.logo} onClick={() => navigate("/")}>Care Connect</h1>
                        <button onClick={() => navigate("/")} style={styles.backButton}>
                            ← Back to Home
                        </button>
                    </div>
                </div>
                <div style={styles.errorContainer}>
                    <p style={styles.errorText}>{error || "Activity not found"}</p>
                    <button onClick={() => navigate("/")} style={styles.homeButton}>
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.logo} onClick={() => navigate("/")}>Care Connect</h1>
                    <button onClick={() => navigate("/")} style={styles.backButton}>
                        ← Back to Home
                    </button>
                </div>
            </div>

            <div style={styles.content}>
                {activity.imageUrl && (
                    <div style={styles.imageContainer}>
                        <img 
                            src={activity.imageUrl} 
                            alt={activity.name}
                            style={styles.image}
                        />
                    </div>
                )}

                <div style={styles.detailCard}>
                    <div style={styles.detailHeader}>
                        <div>
                            <h1 style={styles.title}>{activity.name}</h1>
                            <div style={styles.metaInfo}>
                                {activity.location && (
                                    <div style={styles.metaItem}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span style={styles.metaText}>
                                            {typeof activity.location === 'string' 
                                                ? activity.location 
                                                : activity.location?.name || 'Location TBA'}
                                        </span>
                                    </div>
                                )}
                                {activity.date && (
                                    <div style={styles.metaItem}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="3" y="6" width="18" height="15" rx="2" stroke="#6B7280" strokeWidth="2"/>
                                            <path d="M3 10H21M8 3V6M16 3V6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        <span style={styles.metaText}>
                                            {new Date(activity.date).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                                {activity.createdAt && (
                                    <div style={styles.metaItem}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10" stroke="#6B7280" strokeWidth="2"/>
                                            <path d="M12 6V12L16 14" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        <span style={styles.metaText}>
                                            Created: {new Date(activity.createdAt).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {isLoggedIn && (
                            <div style={styles.adminActions}>
                                <button 
                                    onClick={() => navigate(`/edit-activity/${id}`)} 
                                    style={styles.editButton}
                                >
                                    Edit
                                </button>
                                <button onClick={() => setShowDeleteModal(true)} style={styles.deleteButton}>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>

                    {activity.category && (
                        <div style={styles.categorySection}>
                            <span style={styles.categoryLabel}>Category:</span>
                            <span style={styles.categoryBadge}>{activity.category}</span>
                        </div>
                    )}

                    {/* Funding Progress */}
                    {(activity.targetMoney > 0 || activity.collectedMoney > 0) && (
                        <div style={styles.fundingSection}>
                            <h2 style={styles.sectionTitle}>Funding Progress</h2>
                            <div style={styles.fundingCard}>
                                <div style={styles.fundingStats}>
                                    <div style={styles.fundingStat}>
                                        <p style={styles.fundingLabel}>Collected</p>
                                        <p style={styles.fundingAmount}>
                                            Rp {(activity.collectedMoney || 0).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    {activity.targetMoney > 0 && (
                                        <div style={styles.fundingStat}>
                                            <p style={styles.fundingLabel}>Target</p>
                                            <p style={styles.fundingTarget}>
                                                Rp {activity.targetMoney.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {activity.targetMoney > 0 && (
                                    <div style={styles.progressBarContainer}>
                                        <div 
                                            style={{
                                                ...styles.progressBar,
                                                width: `${Math.min((activity.collectedMoney / activity.targetMoney) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                )}
                                <p style={styles.fundingPercentage}>
                                    {activity.targetMoney > 0 
                                        ? `${Math.round((activity.collectedMoney / activity.targetMoney) * 100)}% funded`
                                        : 'No target set'
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Volunteer Stats */}
                    {activity.collectedVolunteer !== undefined && (
                        <div style={styles.statsSection}>
                            <div style={styles.statCard}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <div>
                                    <p style={styles.statLabel}>Total Volunteers</p>
                                    <p style={styles.statValue}>{activity.collectedVolunteer || 0}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activity.title && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Title</h2>
                            <p style={styles.subtitle}>{activity.title}</p>
                        </div>
                    )}

                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Description</h2>
                        <p style={styles.description}>{activity.description}</p>
                    </div>

                    {/* Location Map */}
                    {activity.location && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Location</h2>
                            <p style={styles.locationName}>
                                📍 {typeof activity.location === 'string' 
                                    ? activity.location 
                                    : activity.location?.name || 'Location TBA'}
                            </p>
                            {(typeof activity.location === 'string' ? activity.location : activity.location?.name) && 
                             (typeof activity.location === 'string' ? activity.location : activity.location?.name) !== 'Location TBA' && (
                                <div style={styles.mapContainer}>
                                    <iframe
                                        width="100%"
                                        height="400"
                                        frameBorder="0"
                                        style={styles.mapIframe}
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(typeof activity.location === 'string' ? activity.location : activity.location?.name)}&output=embed`}
                                        allowFullScreen
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {activity.images && activity.images.length > 0 && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>
                                Gallery ({activity.images.length})
                            </h2>
                            <div style={styles.imageGrid}>
                                {activity.images.map((img, index) => (
                                    <div key={index} style={styles.galleryImageContainer}>
                                        <img 
                                            src={img} 
                                            alt={`${activity.name} - Image ${index + 1}`}
                                            style={styles.galleryImage}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* News Section */}
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Latest News & Updates</h2>
                            {isLoggedIn && (
                                <button onClick={handleAddNews} style={styles.addNewsButton}>
                                    + Add News
                                </button>
                            )}
                        </div>
                        {newsLoading ? (
                            <p style={styles.loadingText}>Loading news...</p>
                        ) : news.length === 0 ? (
                            <p style={styles.emptyText}>No news yet. {isLoggedIn && 'Be the first to add one!'}</p>
                        ) : (
                            <div style={styles.newsList}>
                                {news.map((item) => (
                                    <div key={item._id} style={styles.newsCard}>
                                        <div style={styles.newsHeader}>
                                            <h3 style={styles.newsTitle}>{item.title}</h3>
                                            {isLoggedIn && (
                                                <div style={styles.newsActions}>
                                                    <button onClick={() => handleEditNews(item)} style={styles.editButton}>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteNews(item._id)} style={styles.deleteButton}>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p style={styles.newsDate}>
                                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p style={styles.newsContent}>{item.content}</p>
                                        {item.images && item.images.length > 0 && (
                                            <div style={styles.newsImagesGrid}>
                                                {item.images.map((img, idx) => (
                                                    <div key={idx} style={styles.newsImageContainer}>
                                                        <img 
                                                            src={img} 
                                                            alt={`${item.title} - Image ${idx + 1}`}
                                                            style={styles.newsImage}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {(activity.listVolunteer && activity.listVolunteer.length > 0) && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>
                                Registered Volunteers ({activity.listVolunteer.length})
                            </h2>
                            <div style={styles.volunteerList}>
                                {activity.listVolunteer.map((volunteer, index) => (
                                    <div key={volunteer._id || index} style={styles.volunteerCard}>
                                        <div style={styles.volunteerAvatar}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={styles.volunteerName}>
                                                {volunteer.name || 'Volunteer'}
                                            </p>
                                            {volunteer.phone && (
                                                <p style={styles.volunteerEmail}>{volunteer.phone}</p>
                                            )}
                                            {volunteer.note && (
                                                <p style={styles.volunteerNote}>{volunteer.note}</p>
                                            )}
                                            <p style={styles.volunteerStatus}>
                                                Status: <span style={volunteer.status === 'registered' ? styles.statusActive : styles.statusInactive}>
                                                    {volunteer.status || 'registered'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activity.donations && activity.donations.length > 0 && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>
                                Donations ({activity.donations.length})
                            </h2>
                            <div style={styles.donationList}>
                                {activity.donations.map((donation, index) => (
                                    <div key={index} style={styles.donationCard}>
                                        <div style={styles.donationInfo}>
                                            <p style={styles.donorName}>
                                                {donation.donorName || 'Anonymous'}
                                            </p>
                                            <p style={styles.donationAmount}>
                                                Rp {donation.amount?.toLocaleString('id-ID') || '0'}
                                            </p>
                                        </div>
                                        {donation.message && (
                                            <p style={styles.donationMessage}>{donation.message}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 style={styles.modalTitle}>Delete Activity</h3>
                        <p style={styles.modalMessage}>
                            Are you sure you want to delete this activity? This action cannot be undone.
                        </p>
                        <div style={styles.modalButtons}>
                            <button 
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                style={styles.modalCancelButton}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={handleDelete}
                                style={styles.modalDeleteButton}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete News Confirmation Modal */}
            {showDeleteNewsModal && (
                <div style={styles.modalOverlay} onClick={() => setShowDeleteNewsModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3 style={styles.modalTitle}>Delete News</h3>
                        <p style={styles.modalMessage}>
                            Are you sure you want to delete this news? This action cannot be undone.
                        </p>
                        <div style={styles.modalButtons}>
                            <button 
                                type="button"
                                onClick={() => setShowDeleteNewsModal(false)}
                                style={styles.modalCancelButton}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={confirmDeleteNews}
                                style={styles.modalDeleteButton}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* News Modal */}
            {showNewsModal && (
                <div style={styles.modalOverlay} onClick={() => setShowNewsModal(false)}>
                    <div style={styles.newsModalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>
                            {editingNews ? 'Edit News' : 'Add News'}
                        </h3>
                        <form onSubmit={handleNewsSubmit} style={styles.newsForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Title</label>
                                <input
                                    type="text"
                                    value={newsForm.title}
                                    onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                                    style={styles.input}
                                    placeholder="Enter news title"
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Content</label>
                                <textarea
                                    value={newsForm.content}
                                    onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                                    style={styles.textarea}
                                    placeholder="Enter news content"
                                    rows="6"
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <div style={styles.imageHeader}>
                                    <label style={styles.label}>Images (Optional)</label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowImageModal(true)}
                                        style={styles.addImageButton}
                                    >
                                        + Add Image URL
                                    </button>
                                </div>
                                {newsForm.images.length > 0 && (
                                    <div style={styles.imageList}>
                                        {newsForm.images.map((img, index) => (
                                            <div key={index} style={styles.imageItem}>
                                                <span style={styles.imageUrl}>{img}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleImageRemove(index)}
                                                    style={styles.removeImageButton}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={styles.modalButtons}>
                                <button 
                                    type="button"
                                    onClick={() => setShowNewsModal(false)}
                                    style={styles.modalCancelButton}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    style={styles.submitButton}
                                >
                                    {editingNews ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image URL Modal */}
            {showImageModal && (
                <div style={styles.modalOverlay} onClick={() => setShowImageModal(false)}>
                    <div style={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>Add Image URL</h3>
                        <div style={styles.formGroup}>
                            <input
                                type="url"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                style={styles.input}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div style={styles.modalButtons}>
                            <button 
                                type="button"
                                onClick={() => setShowImageModal(false)}
                                style={styles.modalCancelButton}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={handleImageAdd}
                                style={styles.submitButton}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
    },
    centered: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
    },
    spinner: {
        width: 48,
        height: 48,
        border: '4px solid #E5E7EB',
        borderTop: '4px solid #047857',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: '#6B7280',
        fontSize: 14,
    },
    header: {
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    },
    headerContent: {
        maxWidth: 1280,
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: 700,
        color: '#047857',
        margin: 0,
        cursor: 'pointer',
    },
    backButton: {
        padding: '10px 20px',
        backgroundColor: '#FFFFFF',
        color: '#6B7280',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    errorContainer: {
        maxWidth: 600,
        margin: '64px auto',
        padding: '24px',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        marginBottom: 24,
    },
    homeButton: {
        padding: '12px 24px',
        backgroundColor: '#047857',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    content: {
        maxWidth: 1024,
        margin: '0 auto',
        padding: '32px 24px',
    },
    imageContainer: {
        width: '100%',
        height: 400,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 32,
        backgroundColor: '#E5E7EB',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    detailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    detailHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: '1px solid #E5E7EB',
    },
    title: {
        fontSize: 32,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 16px 0',
    },
    metaInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    metaText: {
        fontSize: 15,
        color: '#6B7280',
    },
    adminActions: {
        display: 'flex',
        gap: 12,
    },
    editButton: {
        padding: '10px 20px',
        backgroundColor: '#047857',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    deleteButton: {
        padding: '10px 20px',
        backgroundColor: '#EF4444',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    section: {
        marginBottom: 32,
    },
    fundingSection: {
        marginBottom: 32,
    },
    fundingCard: {
        backgroundColor: '#F9FAFB',
        padding: 24,
        borderRadius: 12,
        border: '1px solid #E5E7EB',
    },
    fundingStats: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    fundingStat: {
        flex: 1,
    },
    fundingLabel: {
        fontSize: 13,
        color: '#6B7280',
        margin: '0 0 8px 0',
    },
    fundingAmount: {
        fontSize: 24,
        fontWeight: 700,
        color: '#047857',
        margin: 0,
    },
    fundingTarget: {
        fontSize: 24,
        fontWeight: 700,
        color: '#111827',
        margin: 0,
    },
    progressBarContainer: {
        width: '100%',
        height: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#047857',
        transition: 'width 0.3s ease',
    },
    fundingPercentage: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        margin: 0,
    },
    statsSection: {
        marginBottom: 32,
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#ECFDF5',
        padding: 20,
        borderRadius: 12,
        border: '1px solid #D1FAE5',
    },
    statLabel: {
        fontSize: 13,
        color: '#6B7280',
        margin: '0 0 8px 0',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 700,
        color: '#047857',
        margin: 0,
    },
    categorySection: {
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    categoryLabel: {
        fontSize: 14,
        fontWeight: 600,
        color: '#6B7280',
    },
    categoryBadge: {
        display: 'inline-block',
        padding: '6px 16px',
        backgroundColor: '#ECFDF5',
        color: '#047857',
        borderRadius: 20,
        fontSize: 14,
        fontWeight: 600,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 16px 0',
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        lineHeight: 1.6,
        margin: 0,
        fontStyle: 'italic',
    },
    description: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 1.7,
        margin: 0,
        whiteSpace: 'pre-wrap',
    },
    locationName: {
        fontSize: 16,
        color: '#374151',
        marginBottom: 16,
        fontWeight: 500,
    },
    mapContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        marginTop: 12,
    },
    mapIframe: {
        border: 'none',
        borderRadius: 12,
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
    },
    galleryImageContainer: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    volunteerList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 16,
    },
    volunteerCard: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        border: '1px solid #E5E7EB',
    },
    volunteerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ECFDF5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    volunteerName: {
        fontSize: 14,
        fontWeight: 600,
        color: '#111827',
        margin: '0 0 4px 0',
    },
    volunteerEmail: {
        fontSize: 13,
        color: '#6B7280',
        margin: '0 0 4px 0',
    },
    volunteerNote: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
        margin: '4px 0',
    },
    volunteerStatus: {
        fontSize: 12,
        color: '#6B7280',
        margin: '4px 0 0 0',
    },
    statusActive: {
        color: '#047857',
        fontWeight: 600,
    },
    statusInactive: {
        color: '#9CA3AF',
        fontWeight: 600,
    },
    donationList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    donationCard: {
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        border: '1px solid #E5E7EB',
    },
    donationInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    donorName: {
        fontSize: 14,
        fontWeight: 600,
        color: '#111827',
        margin: 0,
    },
    donationAmount: {
        fontSize: 16,
        fontWeight: 700,
        color: '#047857',
        margin: 0,
    },
    donationMessage: {
        fontSize: 13,
        color: '#6B7280',
        margin: 0,
        fontStyle: 'italic',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '90%',
        maxWidth: '450px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
    },
    modalIcon: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '16px',
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '12px',
        margin: '0 0 12px 0',
    },
    modalMessage: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '24px',
        lineHeight: '1.5',
        margin: '0 0 24px 0',
    },
    modalButtons: {
        display: 'flex',
        gap: '12px',
    },
    modalCancelButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#e5e7eb',
        color: '#374151',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    modalDeleteButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    addNewsButton: {
        padding: '10px 20px',
        backgroundColor: '#047857',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    newsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    newsCard: {
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
    },
    newsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px',
    },
    newsTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827',
        margin: 0,
    },
    newsActions: {
        display: 'flex',
        gap: '8px',
    },
    editButton: {
        padding: '6px 12px',
        backgroundColor: '#047857',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    deleteButton: {
        padding: '6px 12px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    newsDate: {
        fontSize: '13px',
        color: '#6b7280',
        marginBottom: '12px',
    },
    newsContent: {
        fontSize: '14px',
        color: '#374151',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
    },
    newsModalContent: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
    },
    newsForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginTop: '16px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
    },
    textarea: {
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    submitButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#047857',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    emptyText: {
        fontSize: '14px',
        color: '#6b7280',
        fontStyle: 'italic',
    },
    newsImagesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '12px',
        marginTop: '12px',
    },
    newsImageContainer: {
        width: '100%',
        height: '150px',
        overflow: 'hidden',
        borderRadius: '8px',
        backgroundColor: '#e5e7eb',
    },
    newsImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    imageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addImageButton: {
        padding: '6px 12px',
        backgroundColor: '#047857',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    imageList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '8px',
    },
    imageItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
    },
    imageUrl: {
        fontSize: '13px',
        color: '#374151',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
    },
    removeImageButton: {
        padding: '4px 8px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        marginLeft: '8px',
    },
    imageModalContent: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
    },
};



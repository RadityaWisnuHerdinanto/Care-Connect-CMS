import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import MapPicker from "../components/MapPicker";

export default function EditActivity() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState("");
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: {
            name: "",
            lat: null,
            lng: null
        },
        images: [],
        category: "",
        targetMoney: 0,
    });

    const base = import.meta.env.VITE_BASE_URL || "https://careconnect.unikloh.icu";

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/login");
            return;
        }
        // Fetch activity data
        fetchActivity();
    }, [navigate, id]);

    const fetchActivity = async () => {
        try {
            const res = await axios.get(`${base}/api/activities/${id}`);
            const activity = res.data.data || res.data;
            
            // Pre-fill form with existing data
            setFormData({
                title: activity.title || "",
                description: activity.description || "",
                location: {
                    name: typeof activity.location === 'string' ? activity.location : activity.location?.name || "",
                    lat: activity.location?.lat || null,
                    lng: activity.location?.lng || null
                },
                images: activity.images || [],
                category: activity.category || "",
                targetMoney: activity.targetMoney || 0,
            });

            // Show map if location has coordinates
            if (activity.location?.lat && activity.location?.lng) {
                setShowMap(true);
            }
        } catch (err) {
            console.error("Failed to fetch activity:", err);
            setError("Failed to load activity. Please try again.");
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "locationName") {
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, name: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLocationChange = (location) => {
        setFormData(prev => ({
            ...prev,
            location: location
        }));
        setShowMapPicker(false);
    };

    const handleImageAdd = () => {
        setShowImageModal(true);
    };

    const handleImageModalClose = () => {
        setShowImageModal(false);
        setNewImageUrl("");
    };

    const handleImageSubmit = () => {
        if (newImageUrl.trim()) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, newImageUrl.trim()]
            }));
            handleImageModalClose();
        }
    };

    const handleImageRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        console.log("Form submitted!", formData);

        if (!formData.title || !formData.description) {
            setError("Title and description are required.");
            return;
        }

        if (!formData.category) {
            setError("Category is required.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            
            // Prepare payload matching backend structure
            const payload = {
                title: formData.title,
                description: formData.description,
                location: {
                    name: formData.location.name || "Location TBA",
                    lat: formData.location.lat || null,
                    lng: formData.location.lng || null
                },
                images: formData.images,
                category: formData.category,
                targetMoney: parseInt(formData.targetMoney) || 0,
            };

            console.log("Sending payload:", payload);
            
            const response = await axios.put(
                `${base}/api/activities/${id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            console.log("Success:", response.data);
            Toastify({
                text: "Activity updated successfully!",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: {
                    background: "#10b981",
                },
            }).showToast();
            navigate(`/activity/${id}`);
        } catch (err) {
            console.error("Error updating activity:", err);
            console.error("Error response:", err?.response?.data);
            console.error("Error status:", err?.response?.status);
            console.error("Full error response:", JSON.stringify(err?.response?.data, null, 2));
            setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to update activity. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div style={styles.centered}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading activity...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.logo} onClick={() => navigate("/")}>Care Connect</h1>
                    <button onClick={() => navigate(`/activity/${id}`)} style={styles.backButton}>
                        ← Back to Activity
                    </button>
                </div>
            </div>

            <div style={styles.formContainer}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Edit Activity</h2>
                    <p style={styles.subtitle}>Update the details of your volunteer activity</p>

                    {error && <div style={styles.errorBanner}>{error}</div>}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="title">Activity Title *</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Enter activity title"
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            >
                                <option value="">Select category</option>
                                <option value="bantuan-sosial">Bantuan Sosial</option>
                                <option value="bencana">Bencana</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                style={{ ...styles.input, ...styles.textarea }}
                                placeholder="Describe the activity..."
                                rows="5"
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="targetMoney">Target Money (Rp)</label>
                            <input
                                id="targetMoney"
                                name="targetMoney"
                                type="number"
                                value={formData.targetMoney}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g., 10000000"
                                min="0"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Location</label>
                            {formData.location.name && formData.location.lat && formData.location.lng ? (
                                <div style={styles.locationInfo}>
                                    <div style={styles.locationDisplay}>
                                        <div style={styles.locationName}>{formData.location.name}</div>
                                        <div style={styles.locationCoords}>
                                            📍 {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowMapPicker(true)}
                                        style={styles.changeLocationButton}
                                    >
                                        Change Location
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => setShowMapPicker(true)}
                                    style={styles.pickLocationButton}
                                >
                                    📍 Pick Location on Map
                                </button>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Images</label>
                            <button 
                                type="button" 
                                onClick={handleImageAdd}
                                style={styles.addImageButton}
                            >
                                + Add Image URL
                            </button>
                            {formData.images.length > 0 && (
                                <div style={styles.imagePreviewContainer}>
                                    {formData.images.map((img, index) => (
                                        <div key={index} style={styles.imagePreviewItem}>
                                            <img src={img} alt={`Preview ${index + 1}`} style={styles.imagePreview} />
                                            <button 
                                                type="button"
                                                onClick={() => handleImageRemove(index)}
                                                style={styles.removeImageButton}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={styles.buttonGroup}>
                            <button 
                                type="button" 
                                onClick={() => navigate(`/activity/${id}`)} 
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                style={{ ...styles.submitButton, ...(loading ? styles.buttonDisabled : {}) }}
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update Activity"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Image URL Modal */}
            {showImageModal && (
                <div style={styles.modalOverlay} onClick={handleImageModalClose}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>Add Image URL</h3>
                        <input
                            type="url"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            style={styles.modalInput}
                            autoFocus
                        />
                        <div style={styles.modalButtons}>
                            <button 
                                type="button"
                                onClick={handleImageModalClose}
                                style={styles.modalCancelButton}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={handleImageSubmit}
                                style={styles.modalSubmitButton}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showMapPicker && (
                <MapPicker 
                    location={formData.location}
                    onLocationChange={handleLocationChange}
                    onClose={() => setShowMapPicker(false)}
                />
            )}
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
    },
    header: {
        backgroundColor: '#047857',
        padding: '20px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: 'white',
        cursor: 'pointer',
        margin: 0,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    formContainer: {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '0 20px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: '30px',
    },
    errorBanner: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
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
        padding: '12px 16px',
        fontSize: '14px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    textarea: {
        resize: 'vertical',
        minHeight: '120px',
        fontFamily: 'inherit',
    },
    locationGroup: {
        display: 'flex',
        gap: '8px',
    },
    searchButton: {
        padding: '12px 24px',
        backgroundColor: '#047857',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap',
    },
    locationGroup: {
        display: 'flex',
        gap: '8px',
    },
    previewButton: {
        padding: '12px 24px',
        backgroundColor: '#047857',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap',
    },
    mapContainer: {
        marginTop: '12px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
    },
    mapIframe: {
        border: 'none',
    },
    addImageButton: {
        padding: '10px 16px',
        backgroundColor: '#e5e7eb',
        color: '#374151',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        alignSelf: 'flex-start',
    },
    imagePreviewContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '12px',
        marginTop: '12px',
    },
    imagePreviewItem: {
        position: 'relative',
        aspectRatio: '1',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #d1d5db',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        width: '28px',
        height: '28px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        lineHeight: 1,
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        marginTop: '12px',
    },
    cancelButton: {
        flex: 1,
        padding: '14px',
        backgroundColor: '#e5e7eb',
        color: '#374151',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    submitButton: {
        flex: 1,
        padding: '14px',
        backgroundColor: '#047857',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed',
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
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '16px',
    },
    modalInput: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '14px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        marginBottom: '16px',
        boxSizing: 'border-box',
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
    },
    modalSubmitButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#047857',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    locationInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    locationDisplay: {
        padding: '16px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
    },
    locationName: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#047857',
        marginBottom: '8px',
    },
    locationCoords: {
        fontSize: '14px',
        color: '#059669',
        fontFamily: 'monospace',
    },
    changeLocationButton: {
        padding: '10px 16px',
        backgroundColor: '#047857',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    pickLocationButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#047857',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    centered: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #e5e7eb',
        borderTop: '5px solid #047857',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '16px',
        color: '#6b7280',
        fontSize: '16px',
    },
};


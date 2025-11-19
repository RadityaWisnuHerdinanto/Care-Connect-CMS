import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import MapPicker from "../components/MapPicker";

export default function CreateActivity() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        }
    }, [navigate]);

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
        console.log("📍 Location selected from MapPicker:", location);
        setFormData(prev => ({
            ...prev,
            location: location
        }));
        setShowMapPicker(false);
        console.log("📍 FormData after location change:", {
            ...formData,
            location: location
        });
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
            // console.log("🔍 FormData sebelum payload:", formData.location);
            // return 
            
            // Prepare payload matching backend structure
            const payload = {
                title: formData.title,
                description: formData.description,
                location: {
                    name: typeof formData.location.name === 'string' 
                        ? formData.location.name || "Location TBA"
                        : formData.location.name?.name || "Location TBA",
                    lat: typeof formData.location.lat === 'number' 
                        ? formData.location.lat 
                        : (formData.location.lat?.lat || null),
                    lng: typeof formData.location.lng === 'number' 
                        ? formData.location.lng 
                        : (formData.location.lng?.lng || null)
                },
                images: formData.images,
                category: formData.category,
                targetMoney: parseInt(formData.targetMoney) || 0,
            };

            console.log("🔍 FormData location sebelum payload:", formData.location);
            console.log("🔍 Type of formData.location.name:", typeof formData.location.name);
            console.log("🔍 FormData.location.name value:", formData.location.name);
            console.log("🔍 Payload location yang dikirim:", payload.location);


            console.log("📤 Full payload:", payload);
            
            const response = await axios.post(
                `${base}/api/activities`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            console.log("✅ Success response:", response.data);
            Toastify({
                text: "Activity created successfully!",
                duration: 2000,
                gravity: "top",
                position: "right",
                style: {
                    background: "#10b981",
                },
            }).showToast();
            navigate("/");
        } catch (err) {
            console.error("Error creating activity:", err);
            console.error("Error response:", err?.response?.data);
            console.error("Error status:", err?.response?.status);
            
            // Check if error is 403 (Admin only)
            if (err?.response?.status === 403) {
                Toastify({
                    text: "⛔ You are not an admin! Please login as admin to create activities.",
                    duration: 2000,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "#ef4444",
                    },
                }).showToast();
                setTimeout(() => navigate("/login"), 1500);
            } else {
                Toastify({
                    text: err?.response?.data?.message || "Failed to create activity. Please try again.",
                    duration: 2000,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "#ef4444",
                    },
                }).showToast();
                setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to create activity. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

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

            <div style={styles.formContainer}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Create New Activity</h2>
                    <p style={styles.subtitle}>Fill in the details to create a new volunteer activity</p>

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
                                placeholder="e.g., Beach Cleanup Day"
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
                            <div style={styles.locationInfo}>
                                {formData.location.name ? (
                                    <div style={styles.locationDisplay}>
                                        <div>
                                            <p style={styles.locationName}>📍 {formData.location.name}</p>
                                            {formData.location.lat && formData.location.lng && (
                                                <p style={styles.locationCoords}>
                                                    Coordinates: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                                                </p>
                                            )}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowMapPicker(true)}
                                            style={styles.changeLocationButton}
                                        >
                                            Change
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
                                <div style={styles.imageList}>
                                    {formData.images.map((img, index) => (
                                        <div key={index} style={styles.imageItem}>
                                            <img src={img} alt={`Preview ${index + 1}`} style={styles.imagePreview} />
                                            <div style={styles.imageInfo}>
                                                <p style={styles.imageUrl}>{img}</p>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleImageRemove(index)}
                                                    style={styles.removeButton}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={styles.buttonGroup}>
                            <button 
                                type="button" 
                                onClick={() => navigate("/")} 
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                style={{ ...styles.submitButton, ...(loading ? styles.buttonDisabled : {}) }}
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create Activity"}
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
                            style={styles.modalInput}
                            placeholder="https://example.com/image.jpg"
                            autoFocus
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleImageSubmit();
                                }
                            }}
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
                                Add Image
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Picker Modal */}
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
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
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
    formContainer: {
        maxWidth: 720,
        margin: '0 auto',
        padding: '40px 24px',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 8px 0',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        margin: '0 0 24px 0',
    },
    errorBanner: {
        padding: '12px 16px',
        backgroundColor: '#FEF2F2',
        color: '#B91C1C',
        borderRadius: 8,
        marginBottom: 24,
        fontSize: 14,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: 14,
        fontWeight: 600,
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        padding: '10px 12px',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        fontSize: 14,
        outline: 'none',
        fontFamily: 'inherit',
    },
    textarea: {
        resize: 'vertical',
        minHeight: 120,
    },
    buttonGroup: {
        display: 'flex',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        padding: '12px 24px',
        backgroundColor: '#FFFFFF',
        color: '#6B7280',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    submitButton: {
        flex: 1,
        padding: '12px 24px',
        backgroundColor: '#047857',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    buttonDisabled: {
        opacity: 0.7,
        cursor: 'not-allowed',
    },
    locationInfo: {
        marginTop: '8px',
    },
    locationDisplay: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#F0FDF4',
        border: '1px solid #047857',
        borderRadius: '8px',
    },
    locationName: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#047857',
    },
    locationCoords: {
        margin: 0,
        fontSize: '12px',
        color: '#6B7280',
    },
    changeLocationButton: {
        padding: '8px 16px',
        backgroundColor: 'white',
        color: '#047857',
        border: '1px solid #047857',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    pickLocationButton: {
        width: '100%',
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
    addImageButton: {
        padding: '10px 16px',
        backgroundColor: '#ECFDF5',
        color: '#047857',
        border: '1px solid #047857',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    imageList: {
        marginTop: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    imageItem: {
        display: 'flex',
        gap: 12,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        border: '1px solid #E5E7EB',
    },
    imagePreview: {
        width: 100,
        height: 100,
        objectFit: 'cover',
        borderRadius: 6,
        flexShrink: 0,
    },
    imageInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    imageUrl: {
        fontSize: 13,
        color: '#6B7280',
        margin: 0,
        wordBreak: 'break-all',
    },
    removeButton: {
        alignSelf: 'flex-start',
        padding: '6px 12px',
        backgroundColor: '#FEE2E2',
        color: '#EF4444',
        border: 'none',
        borderRadius: 6,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 12,
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
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        maxWidth: 500,
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 16px 0',
    },
    modalInput: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        fontSize: 14,
        outline: 'none',
        marginBottom: 20,
        fontFamily: 'inherit',
    },
    modalButtons: {
        display: 'flex',
        gap: 12,
        justifyContent: 'flex-end',
    },
    modalCancelButton: {
        padding: '10px 20px',
        backgroundColor: '#FFFFFF',
        color: '#6B7280',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    modalSubmitButton: {
        padding: '10px 20px',
        backgroundColor: '#047857',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
};

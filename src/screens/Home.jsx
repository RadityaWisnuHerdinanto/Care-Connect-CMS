import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const base = import.meta.env.VITE_BASE_URL || "https://careconnect.unikloh.icu";

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("access_token");
        setIsLoggedIn(!!token);

        // Fetch activities
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await axios.get(`${base}/api/activities`);
            const activitiesData = res.data.data || res.data || [];
            console.log("📊 Activities from backend:", activitiesData);
            console.log("📊 First activity location:", activitiesData[0]?.location);
            setActivities(activitiesData);
        } catch (err) {
            console.error("Failed to fetch activities:", err);
            setError("Failed to load activities. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        navigate("/");
    };

    if (loading) {
        return (
            <div style={styles.centered}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading activities...</p>
            </div>
        );
    }


    // console.log(activities);
    // return null
    
    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.logo}>Care Connect</h1>
                    <div style={styles.headerActions}>
                        {isLoggedIn ? (
                            <>
                                <button
                                    onClick={() => navigate("/create-activity")}
                                    style={styles.addButton}
                                >
                                    + Add Activity
                                </button>
                                <button onClick={handleLogout} style={styles.logoutButton}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button onClick={() => navigate("/login")} style={styles.loginButton}>
                                Login as Admin
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <h2 style={styles.heroTitle}>Make a Difference Today</h2>
                    <p style={styles.heroSubtitle}>
                        Join our community of volunteers and help create positive change
                    </p>
                </div>
            </section>

            {/* Activities Section */}
            <section style={styles.activitiesSection}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Activities</h2>
                    <p style={styles.sectionSubtitle}>
                        Browse and join activities that match your interests
                    </p>
                </div>

                {error && <div style={styles.errorBanner}>{error}</div>}

                {activities.length === 0 ? (
                    <div style={styles.emptyState}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 11H15M12 8V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h3 style={styles.emptyTitle}>No activities yet</h3>
                        <p style={styles.emptyText}>
                            {isLoggedIn
                                ? "Create your first activity to get started!"
                                : "Check back later for upcoming activities"}
                        </p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {activities.map((activity) => (
                            <div key={activity.id || activity._id} style={styles.card}>
                                {activity.imageUrl && (
                                    <div style={styles.cardImage}>
                                        <img
                                            src={activity.imageUrl}
                                            alt={activity.name}
                                            style={styles.image}
                                        />
                                    </div>
                                )}
                                <div style={styles.cardContent}>
                                    <h3 style={styles.cardTitle}>{activity.name}</h3>
                                    {activity.title && (
                                        <p style={styles.cardSubtitle}>{activity.title}</p>
                                    )}
                                    {activity.category && (
                                        <div style={styles.categoryBadge}>
                                            {activity.category}
                                        </div>
                                    )}
                                    <div style={styles.cardMeta}>
                                        {(typeof activity.location === 'string' 
                                            ? activity.location 
                                            : activity.location?.name) && (
                                            <div style={styles.metaItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="3" y="6" width="18" height="15" rx="2" stroke="#6B7280" strokeWidth="2" />
                                                    <path d="M3 10H21M8 3V6M16 3V6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                                <span style={styles.metaText}>
                                                    {new Date(activity.date).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={styles.cardFooter}>
                                        <div style={styles.volunteerInfo}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span style={styles.volunteerCount}>
                                                {activity.volunteers?.length || 0} volunteers
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/activity/${activity.id || activity._id}`)}
                                            style={styles.viewButton}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
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
    },
    headerActions: {
        display: 'flex',
        gap: 12,
    },
    loginButton: {
        padding: '10px 20px',
        backgroundColor: '#047857',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#047857',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    logoutButton: {
        padding: '10px 20px',
        backgroundColor: '#FFFFFF',
        color: '#EF4444',
        border: '1px solid #EF4444',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 14,
    },
    hero: {
        backgroundColor: '#ECFDF5',
        borderBottom: '1px solid #D1FAE5',
    },
    heroContent: {
        maxWidth: 1280,
        margin: '0 auto',
        padding: '48px 24px',
        textAlign: 'center',
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 12px 0',
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#6B7280',
        margin: 0,
    },
    activitiesSection: {
        maxWidth: 1280,
        margin: '0 auto',
        padding: '40px 24px',
    },
    sectionHeader: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 8px 0',
    },
    sectionSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        margin: 0,
    },
    errorBanner: {
        padding: '12px 16px',
        backgroundColor: '#FEF2F2',
        color: '#B91C1C',
        borderRadius: 8,
        marginBottom: 24,
        fontSize: 14,
    },
    emptyState: {
        textAlign: 'center',
        padding: '64px 24px',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 600,
        color: '#111827',
        margin: '16px 0 8px 0',
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        margin: 0,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
    },
    cardImage: {
        width: '100%',
        height: 200,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    cardContent: {
        padding: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 8px 0',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 1.6,
        margin: '0 0 12px 0',
    },
    categoryBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        backgroundColor: '#ECFDF5',
        color: '#047857',
        borderRadius: 16,
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 16,
    },
    cardDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 1.6,
        margin: '0 0 16px 0',
    },
    cardMeta: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginBottom: 16,
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 13,
        color: '#6B7280',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTop: '1px solid #E5E7EB',
    },
    volunteerInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    },
    volunteerCount: {
        fontSize: 13,
        color: '#047857',
        fontWeight: 600,
    },
    viewButton: {
        padding: '8px 16px',
        backgroundColor: '#ECFDF5',
        color: '#047857',
        border: 'none',
        borderRadius: 6,
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 13,
    },
};

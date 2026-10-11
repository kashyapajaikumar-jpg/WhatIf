
import axios from "axios";
import { API } from "./api";

function getSessionId() {
    let id = sessionStorage.getItem("whatif_analytics_session");

    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem("whatif_analytics_session", id);
    }

    return id;
}

export async function trackEvent(eventType, page, action = "") {
    try {
        await axios.post(
            `${API}/analytics/track`,
            {
                eventType,
                page,
                action,
                sessionId: getSessionId()
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
                }
            }
        );
    } catch (error) {
        console.warn("Analytics event could not be recorded.");
    }
}

// Хуки для работы с API
import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

// Campaigns (партии)
export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [allCampaigns, setAllCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/campaigns/');
            // Проверяем если это массив или объект с results (пагинация)
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setCampaigns(data);
        } catch (err) {
            console.error('Ошибка загрузки кампаний:', err);
            setError(err.message);
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAllCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/campaigns/all/');
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setAllCampaigns(data);
        } catch (err) {
            console.error('Ошибка загрузки всех кампаний:', err);
            setError(err.message);
            setAllCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCampaign = useCallback(async (data) => {
        try {
            const response = await axiosInstance.post('/campaigns/', data);
            setCampaigns([...campaigns, response.data]);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [campaigns]);

    const updateCampaign = useCallback(async (id, data) => {
        try {
            const response = await axiosInstance.put(`/campaigns/${id}/`, data);
            setCampaigns(campaigns.map(c => c.id === id ? response.data : c));
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [campaigns]);

    const deleteCampaign = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`/campaigns/${id}/`);
            setCampaigns(campaigns.filter(c => c.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [campaigns]);

    const joinCampaignByCode = useCallback(async ({ campaignId, inviteCode }) => {
        try {
            const response = await axiosInstance.post('/campaigns/join-by-code/', {
                campaign_id: campaignId,
                invite_code: inviteCode,
            });
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    return {
        campaigns,
        allCampaigns,
        loading,
        error,
        fetchCampaigns,
        fetchAllCampaigns,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        joinCampaignByCode,
    };
};

// Characters (персонажи)
export const useCharacters = (campaignId = null) => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCharacters = useCallback(async () => {
        setLoading(true);
        try {
            const url = campaignId
                ? `/characters/?campaign_id=${campaignId}`
                : '/characters/';
            const response = await axiosInstance.get(url);
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setCharacters(data);
        } catch (err) {
            console.error('Ошибка загрузки персонажей:', err);
            setError(err.message);
            setCharacters([]);
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    const createCharacter = useCallback(async (data) => {
        try {
            const response = await axiosInstance.post('/characters/', data);
            setCharacters([...characters, response.data]);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [characters]);

    const updateCharacter = useCallback(async (id, data) => {
        try {
            const response = await axiosInstance.put(`/characters/${id}/`, data);
            setCharacters(characters.map(c => c.id === id ? response.data : c));
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [characters]);

    const deleteCharacter = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`/characters/${id}/`);
            setCharacters(characters.filter(c => c.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [characters]);

    return {
        characters,
        loading,
        error,
        fetchCharacters,
        createCharacter,
        updateCharacter,
        deleteCharacter,
    };
};

// Sessions (сессии/игры)
export const useSessions = (campaignId = null) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const url = campaignId
                ? `/sessions/?campaign_id=${campaignId}`
                : '/sessions/';
            const response = await axiosInstance.get(url);
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setSessions(data);
        } catch (err) {
            console.error('Ошибка загрузки сессий:', err);
            setError(err.message);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    const createSession = useCallback(async (data) => {
        try {
            const response = await axiosInstance.post('/sessions/', data);
            setSessions([...sessions, response.data]);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [sessions]);

    const updateSession = useCallback(async (id, data) => {
        try {
            const response = await axiosInstance.put(`/sessions/${id}/`, data);
            setSessions(sessions.map(s => s.id === id ? response.data : s));
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [sessions]);

    const deleteSession = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`/sessions/${id}/`);
            setSessions(sessions.filter(s => s.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [sessions]);

    return {
        sessions,
        loading,
        error,
        fetchSessions,
        createSession,
        updateSession,
        deleteSession,
    };
};

// Notes (записки, квесты, NPC)
export const useNotes = (campaignId = null, type = null) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            let url = '/notes/';
            const params = new URLSearchParams();
            if (campaignId) params.append('campaign_id', campaignId);
            if (type) params.append('type', type);

            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await axiosInstance.get(url);
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setNotes(data);
        } catch (err) {
            console.error('Ошибка загрузки заметок:', err);
            setError(err.message);
            setNotes([]);
        } finally {
            setLoading(false);
        }
    }, [campaignId, type]);

    const createNote = useCallback(async (data) => {
        try {
            const response = await axiosInstance.post('/notes/', data);
            setNotes([...notes, response.data]);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [notes]);

    const updateNote = useCallback(async (id, data) => {
        try {
            const response = await axiosInstance.put(`/notes/${id}/`, data);
            setNotes(notes.map(n => n.id === id ? response.data : n));
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [notes]);

    const deleteNote = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`/notes/${id}/`);
            setNotes(notes.filter(n => n.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [notes]);

    return {
        notes,
        loading,
        error,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
    };
};

// Session Logs (журналы сессий)
export const useSessionLogs = (campaignId = null) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const url = campaignId
                ? `/session-logs/?campaign_id=${campaignId}`
                : '/session-logs/';
            const response = await axiosInstance.get(url);
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            setLogs(data);
        } catch (err) {
            console.error('Ошибка загрузки логов:', err);
            setError(err.message);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    const createLog = useCallback(async (data) => {
        try {
            const response = await axiosInstance.post('/session-logs/', data);
            setLogs([...logs, response.data]);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [logs]);

    const updateLog = useCallback(async (id, data) => {
        try {
            const response = await axiosInstance.put(`/session-logs/${id}/`, data);
            setLogs(logs.map(l => l.id === id ? response.data : l));
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [logs]);

    const deleteLog = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`/session-logs/${id}/`);
            setLogs(logs.filter(l => l.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [logs]);

    return {
        logs,
        loading,
        error,
        fetchLogs,
        createLog,
        updateLog,
        deleteLog,
    };
};

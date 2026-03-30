import { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const TokenHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) return;

        // Comprobar si el usuario necesita el wizard o puede entrar directamente.
        // Se da en Google OAuth cuando el usuario ya tenía cuenta (profileCompleted: true).
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        fetch(`${backendUrl}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : null)
            .then(user => {
                if (user) login(token, user);
                else localStorage.setItem('authToken', token);
                const needsWizard = user && !user.accountType && !user.profileCompleted;
                navigate(needsWizard ? '/complete-registration' : '/explorer', { replace: true });
            })
            .catch(() => {
                localStorage.setItem('authToken', token);
                navigate('/explorer', { replace: true });
            });
    }, [location, navigate]);

    return null;
};

export default TokenHandler;
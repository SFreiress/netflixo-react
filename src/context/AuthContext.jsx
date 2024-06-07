/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

function AuthProvider({ children }){
    const [errorMessage, setErrorMessage] = useState(null);

    const navigate = useNavigate();

    const login = async (credentials) => {
        try {
           const response = await api.post('/auth/login', { ...credentials });
           const data = response.data;
           if (data.accessToken !== null) {
            localStorage.setItem('username', data.username)
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('authenticated', true)
            findAdmin(data.username);
           }
        } catch (err) {
            setErrorMessage(err.message)
        }
    }

    const loginRefreshed = async (credentials, param) => {
        try {
            const response = await api.post('/auth/login', { ...credentials });
            const data = response.data;
            if (data.accessToken !== null) {
                localStorage.setItem('accessToken', data.accessToken)
                localStorage.setItem('refreshToken', data.refreshToken)
            } else {
                setErrorMessage(data.message)
            }
            if (param === false) {
                window.location.reload();
            }
        } catch (err) {
            setErrorMessage(err.message)
        }
    }

    const findAdmin = async(username) => {
        try {
            const response = await api.get(`/api/user/username/${(username)}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (response.status === 200){
                localStorage.setItem('roles', JSON.stringify(response.data.roles));
                localStorage.setItem('idAdmin', response.data.id)
                navigate('/home')
            } else {
                setErrorMessage(response.data.message)
            }
        } catch (err) {
            setErrorMessage(err.response.data.message)
        }
    } 

    const logout = () => {
        const sessaoArmazenada = localStorage.getItem('setor');
        if (sessaoArmazenada !== null){
            localStorage.removeItem('setor')
        } else {
            localStorage.removeItem('unidade')
        }
        localStorage.removeItem('username')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('roles')
        localStorage.removeItem('idAdmin')
        localStorage.removeItem('authenticated')
        navigate('/')
    }

    const memo = useMemo(() => ({
       errorMessage,
       login,
       logout,
       loginRefreshed
    }), [ errorMessage, login, logout, loginRefreshed ]);

    return (
        <AuthContext.Provider value={memo}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider }
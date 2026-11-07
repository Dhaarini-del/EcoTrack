import React,{createContext,useContext,useEffect,useState}from'react';import api from './api';
const C=createContext(null);
export function AuthProvider({children}){const[user,setUser]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>{if(localStorage.getItem('ecotrack_token'))api.get('/auth/me').then(r=>setUser(r.data.user)).catch(()=>localStorage.removeItem('ecotrack_token')).finally(()=>setLoading(false));else setLoading(false)},[]);
 const login=async(email,password)=>{const{data}=await api.post('/auth/login',{email,password});localStorage.setItem('ecotrack_token',data.token);setUser(data.user)};
 const logout=()=>{localStorage.removeItem('ecotrack_token');setUser(null)};
 return <C.Provider value={{user,loading,login,logout}}>{children}</C.Provider>}
export const useAuth=()=>useContext(C);

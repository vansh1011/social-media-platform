import axios from 'axios';


const isProduction = import.meta.env.MODE === 'production';

const api = axios.create({
  
    baseURL: isProduction ? '/api' : 'http://localhost:8000',
    withCredentials: true 
});

export default api;
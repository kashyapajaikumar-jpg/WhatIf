import axios from "axios";
export const API="https://whatif-1a0j.onrender.com/api";
axios.defaults.baseURL=API;
axios.interceptors.request.use(config=>{
    const token=localStorage.getItem("token");
    if(token&&!config.headers.Authorization){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
},error=>Promise.reject(error));
axios.interceptors.response.use(response=>response,error=>{
    const status=error.response?.status;
    if(status===401&&localStorage.getItem("token")){
        const url=error.config?.url||"";
        if(!url.includes("/auth/login")&&!url.includes("/auth/admin-login")&&!url.includes("/auth/register")){
            localStorage.removeItem("token");
        }
    }
    return Promise.reject(error);
});

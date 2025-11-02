import axios from 'axios';

const BASE_URL = '/api';

// Configuração do axios com interceptor para refresh token automático
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gerenciamento de tokens
export const persistTokens = (accessToken, refreshToken, orgId = null) => {
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
  if (orgId) {
    localStorage.setItem('org_id', orgId);
  }
};

export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const getOrgId = () => localStorage.getItem('org_id');

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('org_id');
};

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para refresh token automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          persistTokens(access_token, refreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH ====================

export const loginUser = async (email, password) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const loginAdmin = async (email, password) => {
  const response = await axios.post(`${BASE_URL}/auth/admin-login`, {
    email,
    password,
  });
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await axios.post(`${BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });
  return response.data;
};

export const registerUser = async (name, email, password, orgName = null) => {
  const response = await axios.post(`${BASE_URL}/auth/register`, {
    name,
    email,
    password,
    org_name: orgName,
  });
  return response.data;
};

export const acceptInvite = async (inviteToken, password) => {
  const response = await axios.post(`${BASE_URL}/auth/accept-invite`, {
    invite_token: inviteToken,
    password,
  });
  return response.data;
};

// ==================== MEMBERS ====================

export const getMyProfile = async () => {
  const response = await api.get('/members/me');
  return response.data;
};

export const getMyOrganization = async () => {
  const response = await api.get('/members/my-org');
  return response.data;
};

export const inviteMember = async (orgId, email, roleInOrg = 'member') => {
  const response = await api.post(`/members/orgs/${orgId}/invite`, {
    email,
    role_in_org: roleInOrg,
  });
  return response.data;
};

export const listOrgMembers = async (orgId) => {
  const response = await api.get(`/members/orgs/${orgId}/members`);
  return response.data;
};

export const removeMember = async (orgId, userId) => {
  const response = await api.delete(`/members/orgs/${orgId}/members/${userId}`);
  return response.data;
};

// ==================== ADMIN ====================

export const createOrganization = async (orgData) => {
  const response = await api.post('/admin/orgs', {
    name: orgData.name,
    db_host: orgData.db_host,
    db_port: orgData.db_port,
    db_name: orgData.db_name,
    db_user: orgData.db_user,
    db_password: orgData.db_password,
    allowed_schemas: orgData.allowed_schemas || [],
    driver: orgData.driver || 'mysql',
  });
  return response.data;
};

export const listOrganizations = async () => {
  const response = await api.get('/admin/orgs');
  return response.data;
};

export const getOrganization = async (orgId) => {
  const response = await api.get(`/admin/orgs/${orgId}`);
  return response.data;
};

export const testConnection = async (orgId) => {
  const response = await api.post(`/admin/orgs/${orgId}/test-connection`);
  return response.data;
};

export const addMemberToOrg = async (orgId, userId, roleInOrg = 'member') => {
  const response = await api.post(`/admin/orgs/${orgId}/members`, {
    user_id: userId,
    role_in_org: roleInOrg,
  });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// ==================== QUERY (Principal) ====================

export const perguntarOrg = async ({ org_id, pergunta, max_linhas = 10, enrich = true }) => {
  const response = await api.post('/perguntar_org', {
    org_id,
    pergunta,
    max_linhas,
    enrich,
  });
  return response.data;
};

export default api;

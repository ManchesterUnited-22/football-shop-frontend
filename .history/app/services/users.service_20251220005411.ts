// app/services/user.service.ts

const API_URL = 'http://localhost:3001/users';

export const updateProfile = async (name: string) => {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_URL}/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cập nhật thất bại');
    }

    return response.json();
};
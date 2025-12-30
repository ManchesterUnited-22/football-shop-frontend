// app/services/user.service.ts
const API_URL = 'http://localhost:3001/users'; 

export const updateProfile = async (userData: { name: string; email: string }) => {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_URL}/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData), 
    });

    if (!response.ok) {
        const errorData = await response.json();
        // Xử lý lỗi trùng Email từ Backend trả về
        throw new Error(errorData.message || 'Cập nhật thất bại');
    }

    return response.json(); 
};

import axios from "axios";
const apiUrl = "http://localhost:3000";

export const updateCustomer = async (customerData: any) => {
        const token = localStorage.getItem("authToken");
    const customerId = localStorage.getItem("customerId");
    const response = await axios.post(`${apiUrl}/customer/update-customer`, customerData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    return response.data;
}
     

export const getAllPerfumes = async () => {
     const response = await axios.get(`${apiUrl}/perfume`);
     return response.data;
}

export const getPerfumeById = async (id: string) => {
    console.log("id", id);
    const response = await axios.get(`${apiUrl}/perfume/${id}`);
    return response.data;
}

export const addToCart = async ( quantity: number, totalPrice: number, perfumeId: string) => {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("authToken");
    console.log("token", token);
    const body = {
        customerId,
        quantity,
        totalPrice,
        perfumeId
    }
    console.log("body", body);
    const response = await axios.post(`${apiUrl}/customer/add-to-cart`, body, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    console.log("response", response);
    return response.data;
}

export const getAllCart = async () => { 
    const token = localStorage.getItem("authToken");
    const customerId = localStorage.getItem("customerId");
    const response = await axios.post(`${apiUrl}/customer/get-all-carts`, {
        customerId
    }, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    console.log("response", response);
    return response.data;
}

export const deleteCart = async (cartId: string) => {
    const token = localStorage.getItem("authToken");
    const response = await axios.delete(`${apiUrl}/customer/delete-cart`, {
        data: { cartId },
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    return response.data;
}

export const createOrder = async ( cartId: string,orderData: any) => {
    const token = localStorage.getItem("authToken");
    const customerId = localStorage.getItem("customerId");
    
    const body = {
        customerId,
        cartId,
        ...orderData
    };
    
    const response = await axios.post(`${apiUrl}/customer/create-order`, body, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    console.log("Order response", response);
    return response.data;
}



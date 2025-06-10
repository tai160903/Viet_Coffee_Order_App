import axios from "axios";

const cartService=  {
    getCart:
        async () => {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/Cart`, {
                headers: {
                    'Content-Type': 'application/json',
                },;
            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }
            return response.json();
        },
}
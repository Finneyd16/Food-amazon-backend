require('dotenv').config();
const axios = require('axios');

async function testPaystack() {
    try {
        const response = await axios.get(
            'https://api.paystack.co/transaction',
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` // ✅ Fixed: Use backticks
                }
            }
        );
        console.log('✅ Paystack connection successful');
        console.log('Response:', response.data);
    } catch (error) {
        console.error('❌ Paystack connection failed:', error.response?.data || error.message);
    }
}

testPaystack();
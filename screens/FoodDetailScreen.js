import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';

const FoodDetailScreen = ({ route }) => {
    const { food } = route.params;
    const [quantity, setQuantity] = useState(1);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const fetchPaymentIntentClientSecret = async () => {
        try {
            const response = await axios.post('https://e7aa-27-34-80-142.ngrok-free.app/create-payment-intent', {
                amount: food.price * quantity * 100, // amount in cents
            });
            const { clientSecret } = response.data;
            return clientSecret;
        } catch (error) {
            console.error('Error fetching payment intent:', error);
            throw new Error('Failed to fetch payment intent.');
        }
    };

    // Handles the buy food action
    const handleBuyFood = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const clientSecret = await fetchPaymentIntentClientSecret();
                const { error } = await initPaymentSheet({
                    paymentIntentClientSecret: clientSecret,
                    returnURL: 'https://aacharyanischal.com/payment-complete',
                });
                if (!error) {
                    const { error: paymentError } = await presentPaymentSheet();
                    if (!paymentError) {
                        const orderId = `order_${new Date().getTime()}`;
                        const orderDoc = doc(db, 'orders', orderId);
                        await setDoc(orderDoc, {
                            userId: user.uid,
                            date: new Date().toISOString(),
                            total: food.price * quantity,
                            items: [
                                {
                                    name: food.name,
                                    price: food.price,
                                    quantity: quantity,
                                },
                            ],
                            status: 'payment complete',
                        });
                        Alert.alert('Success', `You have bought ${quantity} ${food.name}(s) for Rs. ${food.price * quantity}`);
                    } else {
                        Alert.alert('Error', 'There was an error processing your payment. Please try again.');
                    }
                } else {
                    Alert.alert('Error', 'There was an error initializing the payment sheet. Please try again.');
                }
            } catch (error) {
                console.error('Error adding order: ', error);
                Alert.alert('Error', 'There was an error processing your order. Please try again.');
            }
        } else {
            Alert.alert('Error', 'You need to be logged in to place an order.');
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={food.image ? { uri: food.image } : require('../assets/img/food.png')}
                style={styles.foodImage}
                resizeMode="cover"
            />

            <View style={styles.detailsContainer}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodPrice}>Rs. {food.price}</Text>
                <Text style={styles.foodDescription}>{food.description}</Text>

                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Quantity:</Text>
                    <View style={styles.quantityButtons}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                        >
                            <Icon name="remove-outline" size={20} color="#6200EE" />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(quantity + 1)}
                        >
                            <Icon name="add-outline" size={20} color="#6200EE" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.buyButton} onPress={handleBuyFood}>
                    <Icon name="cart-outline" size={20} color="#fff" />
                    <Text style={styles.buyButtonText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    foodImage: {
        width: '100%',
        height: 250,
    },
    detailsContainer: {
        padding: 20,
    },
    foodName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    foodPrice: {
        fontSize: 20,
        color: '#6200EE',
        marginBottom: 10,
    },
    foodDescription: {
        fontSize: 16,
        color: '#555',
        marginBottom: 15,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    quantityLabel: {
        fontSize: 18,
        marginRight: 10,
        color: '#333',
    },
    quantityButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 5,
    },
    quantity: {
        fontSize: 18,
        marginHorizontal: 10,
        color: '#333',
    },
    buyButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: 'row',
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 5,
        textAlign: 'center',
    },
});

export default FoodDetailScreen;

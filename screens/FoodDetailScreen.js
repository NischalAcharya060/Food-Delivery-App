import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import dummyFoodImage from "../assets/img/food.jpg";

const FoodDetailScreen = ({ route }) => {
    const { food } = route.params;
    const [quantity, setQuantity] = useState(1);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');

    const fetchPaymentIntentClientSecret = async () => {
        try {
            const response = await axios.post('https://813d-27-34-80-171.ngrok-free.app/create-payment-intent', {
                amount: food.price * quantity * 100,
            });
            const { clientSecret } = response.data;
            return clientSecret;
        } catch (error) {
            console.error('Error fetching payment intent:', error);
            throw new Error('Failed to fetch payment intent.');
        }
    };

    const handleBuyFood = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                setLoading(true);
                if (paymentMethod === 'online') {
                    const clientSecret = await fetchPaymentIntentClientSecret();
                    const { error } = await initPaymentSheet({
                        paymentIntentClientSecret: clientSecret,
                        returnURL: 'https://aacharyanischal.com/payment-complete',
                    });
                    if (!error) {
                        const { error: paymentError } = await presentPaymentSheet();
                        if (!paymentError) {
                            await saveOrder('payment complete');
                        } else {
                            Alert.alert('Error', 'There was an error processing your payment. Please try again.');
                        }
                    } else {
                        Alert.alert('Error', 'There was an error initializing the payment sheet. Please try again.');
                    }
                } else {
                    await saveOrder('pending');
                }
            } catch (error) {
                console.error('Error adding order: ', error);
                Alert.alert('Error', 'There was an error processing your order. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert('Error', 'You need to be logged in to place an order.');
        }
    };

    const saveOrder = async (status) => {
        try {
            const orderId = `order_${new Date().getTime()}`;
            const orderDocRef = doc(db, 'orders', orderId);
            await setDoc(orderDocRef, {
                userId: auth.currentUser.uid,
                date: new Date().toISOString(),
                total: food.price * quantity,
                items: [
                    {
                        name: food.name,
                        price: food.price,
                        quantity: quantity,
                    },
                ],
                status: status,
            });
            Alert.alert('Success', `You have bought ${quantity} ${food.name}(s) for Rs. ${food.price * quantity}`);
            navigation.navigate('PaymentSuccess');
        } catch (error) {
            console.error('Error saving order: ', error);
            Alert.alert('Error', 'There was an error saving your order. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={food.foodImage ? { uri: food.foodImage } : dummyFoodImage}
                style={styles.foodImage}
                resizeMode="cover"
                PlaceholderContent={<ActivityIndicator />}
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
                            disabled={loading}
                        >
                            <Icon name="remove-outline" size={20} color="#6200EE" />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(quantity + 1)}
                            disabled={loading}
                        >
                            <Icon name="add-outline" size={20} color="#6200EE" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.paymentOptions}>
                    <TouchableOpacity
                        style={[styles.paymentOptionButton, paymentMethod === 'online' && styles.activePaymentOption]}
                        onPress={() => setPaymentMethod('online')}
                    >
                        <Icon name="logo-skype" size={20} color={paymentMethod === 'online' ? '#ffffff' : '#6200EE'} />
                        <Text style={[styles.paymentOptionText, paymentMethod === 'online' && styles.activePaymentOptiontext]}> Pay Online</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.paymentOptionButton, paymentMethod === 'cod' && styles.activePaymentOption]}
                        onPress={() => setPaymentMethod('cod')}
                    >
                        <Icon name="cash" size={20} color={paymentMethod === 'cod' ? '#ffffff' : '#6200EE'} />
                        <Text style={[styles.paymentOptionText, paymentMethod === 'cod' && styles.activePaymentOptiontext]}> Cash On Delivery</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.buyButton} onPress={handleBuyFood} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon name="cart-outline" size={20} color="#fff" />
                            <Text style={styles.buyButtonText}> Buy Now</Text>
                        </>
                    )}
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
    paymentOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    paymentOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#6200EE',
    },
    paymentOptionText: {
        color: '#6200EE',
        fontSize: 16,
    },
    activePaymentOption: {
        backgroundColor: '#6200EE',
    },
    activePaymentOptiontext: {
        color: '#ffffff',
    },
    buyButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 5,
        textAlign: 'center',
    },
});

export default FoodDetailScreen;

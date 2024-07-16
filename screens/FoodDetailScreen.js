import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
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
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isValidCode, setIsValidCode] = useState(false);

    const fetchPaymentIntentClientSecret = async () => {
        try {
            const response = await axios.post('https://898a-27-34-80-171.ngrok-free.app/create-payment-intent', {
                amount: (food.price * quantity - discountAmount) * 100,
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
                total: food.price * quantity - discountAmount,
                items: [
                    {
                        name: food.name,
                        price: food.price,
                        quantity: quantity,
                    },
                ],
                status: status,
                discountCode: isValidCode ? discountCode : null,
                discountAmount: discountAmount,
            });
            Alert.alert('Success', `You have bought ${quantity} ${food.name}(s) for Rs. ${food.price * quantity - discountAmount}`);
            navigation.navigate('PaymentSuccess');
        } catch (error) {
            console.error('Error saving order: ', error);
            Alert.alert('Error', 'There was an error saving your order. Please try again.');
        }
    };

    const validateDiscountCode = () => {
        if (discountCode === 'Nischal') {
            setDiscountAmount(10);
            setIsValidCode(true);
            Alert.alert('Success', 'Discount code applied successfully!');
        } else {
            setDiscountAmount(0);
            setIsValidCode(false);
            Alert.alert('Error', 'Invalid discount code.');
        }
    };

    return (
        <ScrollView style={styles.container}>
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

                {food.restaurant && (
                    <View style={styles.restaurantDetails}>
                        <Text style={styles.restaurantTitle}>Restaurant Details:</Text>
                        <Text style={styles.restaurantDetail}>Name: {food.restaurant.name}</Text>
                        <Text style={styles.restaurantDetail}>Address: {food.restaurant.address}</Text>
                        <Text style={styles.restaurantDetail}>Cuisine: {food.restaurant.cuisine}</Text>
                        <Text style={styles.restaurantDetail}>Description: {food.restaurant.description}</Text>
                        <Text style={styles.restaurantDetail}>Phone: {food.restaurant.phone}</Text>
                        <Text style={styles.restaurantDetail}>Coordinates: {food.restaurant.coordinates.latitude}, {food.restaurant.coordinates.longitude}</Text>
                    </View>
                )}

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

                <View style={styles.discountContainer}>
                    <TextInput
                        style={styles.discountInput}
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChangeText={setDiscountCode}
                        editable={!isValidCode}
                    />
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={validateDiscountCode}
                        disabled={isValidCode || loading}
                    >
                        <Text style={styles.applyButtonText}>{isValidCode ? 'Applied' : 'Apply'}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.totalPrice}>Total: Rs. {food.price * quantity - discountAmount}</Text>

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
        </ScrollView>
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
    discountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    discountInput: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 5,
        marginRight: 10,
        fontSize: 16,
        color: '#333',
    },
    applyButton: {
        backgroundColor: '#6200EE',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    applyButtonText: {
        fontSize: 16,
        color: '#fff',
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#6200EE',
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
        color: '#fff',
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6200EE',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 5,
        justifyContent: 'center',
    },
    buyButtonText: {
        fontSize: 18,
        color: '#fff',
        marginLeft: 10,
    },
    restaurantDetails: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    restaurantTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    restaurantDetail: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
});

export default FoodDetailScreen;

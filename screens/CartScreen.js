import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const dummyFoodImage = require('../assets/img/food.jpg');

const CartScreen = ({ route }) => {
    const { cart } = route.params;
    const [cartItems, setCartItems] = useState(cart);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');

    const fetchPaymentIntentClientSecret = async (amount) => {
        try {
            const response = await axios.post('https://1495-2400-1a00-bd20-a202-1819-281a-dbb7-4593.ngrok-free.app/create-payment-intent', {
                amount: amount * 100,
            });
            const { clientSecret } = response.data;
            return clientSecret;
        } catch (error) {
            console.error('Error fetching payment intent:', error);
            throw new Error('Failed to fetch payment intent.');
        }
    };

    const handleRemoveItem = (item) => {
        const updatedCart = cartItems.filter(cartItem => cartItem.id !== item.id);
        setCartItems(updatedCart);
    };

    const handleQuantityChange = (item, increment) => {
        const updatedCart = cartItems.map(cartItem => {
            if (cartItem.id === item.id) {
                const newQuantity = increment ? cartItem.quantity + 1 : cartItem.quantity - 1;
                return { ...cartItem, quantity: Math.max(newQuantity, 1) };
            }
            return cartItem;
        });
        setCartItems(updatedCart);
    };

    const handleCheckout = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                if (cartItems.length > 0) {
                    setLoading(true);
                    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
                    if (paymentMethod === 'online') {
                        const clientSecret = await fetchPaymentIntentClientSecret(totalAmount);
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
                } else {
                    Alert.alert('Cart Empty', 'Please add items to the cart.');
                }
            } catch (error) {
                console.error('Error processing order: ', error);
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
            const orderDoc = doc(db, 'orders', orderId);
            await setDoc(orderDoc, {
                userId: auth.currentUser.uid,
                date: new Date().toISOString(),
                total: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
                items: cartItems,
                status: status,
            });
            Alert.alert('Success', 'Your order has been placed successfully.');
            navigation.navigate('PaymentSuccess');
        } catch (error) {
            console.error('Error saving order: ', error);
            Alert.alert('Error', 'There was an error saving your order. Please try again.');
        }
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image
                source={item.image ? { uri: item.image } : dummyFoodImage}
                style={styles.cartItemImage}
                resizeMode="cover"
            />
            <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>Rs. {item.price}</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item, false)}
                        disabled={loading}
                    >
                        <Icon name="remove-outline" size={20} color="#6200EE" />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item, true)}
                        disabled={loading}
                    >
                        <Icon name="add-outline" size={20} color="#6200EE" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item)}>
                    <Icon name="trash-outline" size={20} color="#fff" />
                    <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>My Cart</Text>
            <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <Divider />}
                ListEmptyComponent={() => <Text style={styles.emptyText}>No items in the cart</Text>}
                contentContainerStyle={styles.content}
            />
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
            <View style={styles.footer}>
                <Button mode="contained" onPress={handleCheckout} style={styles.checkoutButton} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutButtonText}>Checkout</Text>}
                </Button>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    content: {
        paddingHorizontal: 10,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 5,
        elevation: 5,
    },
    cartItemImage: {
        width: 80,
        height: 80,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    cartItemDetails: {
        flex: 1,
        padding: 10,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartItemPrice: {
        fontSize: 14,
        color: '#888',
        marginVertical: 5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    quantityButton: {
        backgroundColor: '#eee',
        padding: 5,
        borderRadius: 5,
    },
    quantity: {
        fontSize: 18,
        marginHorizontal: 10,
        color: '#333',
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e74c3c',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    removeButtonText: {
        color: '#fff',
        marginLeft: 5,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
    },
    paymentOptions: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 10,
    },
    paymentOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#fff',
        elevation: 3,
    },
    activePaymentOption: {
        backgroundColor: '#6200EE',
    },
    paymentOptionText: {
        marginLeft: 5,
        color: '#6200EE',
    },
    activePaymentOptiontext: {
        color: '#ffffff',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    checkoutButton: {
        backgroundColor: '#6200EE',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default CartScreen;

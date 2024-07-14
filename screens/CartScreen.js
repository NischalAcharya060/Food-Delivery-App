import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert, SafeAreaView } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import Icon from "react-native-vector-icons/Ionicons";

const dummyFoodImage = require('../assets/img/food.jpg');

const CartScreen = ({ navigation, route }) => {
    const { cart } = route.params;
    const [cartItems, setCartItems] = useState(cart.map(item => ({ ...item, quantity: 1 })));

    const handleRemoveItem = (item) => {
        const updatedCart = cartItems.filter(cartItem => cartItem.id !== item.id);
        setCartItems(updatedCart);
    };

    const handleIncreaseQuantity = (item) => {
        const updatedCart = cartItems.map(cartItem =>
            cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
        );
        setCartItems(updatedCart);
    };

    const handleDecreaseQuantity = (item) => {
        if (item.quantity > 1) {
            const updatedCart = cartItems.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity - 1 }
                    : cartItem
            );
            setCartItems(updatedCart);
        }
    };

    const handleCheckout = () => {
        if (cartItems.length > 0) {
            Alert.alert("Checkout", "Proceed to payment.");
        } else {
            Alert.alert("Cart Empty", "Please add items to the cart.");
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
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleDecreaseQuantity(item)}>
                        <Icon name="remove-outline" size={20} color="#6200EE" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleIncreaseQuantity(item)}>
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
            <View style={styles.footer}>
                <Button mode="contained" onPress={handleCheckout} style={styles.checkoutButton}>
                    <Text style={styles.checkoutButtonText}>Checkout</Text>
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
        marginTop: 10,
    },
    quantityButton: {
        backgroundColor: '#fff',
        padding: 5,
        borderWidth: 1,
        borderColor: '#6200EE',
        borderRadius: 5,
        elevation: 2,
    },
    quantityText: {
        marginHorizontal: 10,
        fontSize: 16,
        fontWeight: 'bold',
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
    footer: {
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#fff',
    },
    checkoutButton: {
        backgroundColor: '#6200EE',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#333',
        marginTop: 20,
    },
});

export default CartScreen;

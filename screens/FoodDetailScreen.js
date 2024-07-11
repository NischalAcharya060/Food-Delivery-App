import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import { db, auth } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const FoodDetailScreen = ({ route }) => {
    const { food } = route.params;
    const [quantity, setQuantity] = useState(1);

    const handleBuyFood = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
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
                            quantity: quantity
                        }
                    ]
                });
                Alert.alert('Success', `You have bought ${quantity} ${food.name}(s) for Rs. ${food.price * quantity}`);
            } catch (error) {
                console.error("Error adding order: ", error);
                Alert.alert('Error', 'There was an error processing your order. Please try again.');
            }
        } else {
            Alert.alert('Error', 'You need to be logged in to place an order.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Food Image */}
            <Image
                source={food.image ? { uri: food.image } : require('../assets/img/food.png')}
                style={styles.foodImage}
                resizeMode="cover"
            />

            {/* Food Details */}
            <View style={styles.detailsContainer}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodPrice}>Rs. {food.price}</Text>
                <Text style={styles.foodDescription}>{food.description}</Text>

                {/* Quantity Selector */}
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
    restaurantName: {
        fontSize: 16,
        color: '#777',
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
        borderRadius: 5,
        alignItems: 'center',
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default FoodDetailScreen;

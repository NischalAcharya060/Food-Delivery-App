import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Card, Searchbar } from 'react-native-paper';

const OrderHistoryScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const auth = getAuth();
    const firestore = getFirestore();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const user = auth.currentUser;
                const ordersRef = collection(firestore, 'orders');
                const q = query(ordersRef, where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const fetchedOrders = [];
                querySnapshot.forEach((doc) => {
                    fetchedOrders.push({ id: doc.id, ...doc.data() });
                });
                setOrders(fetchedOrders);
                setFilteredOrders(fetchedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query) {
            const filtered = orders.filter(order =>
                order.items.some(item =>
                    item.name.toLowerCase().includes(query.toLowerCase())
                )
            );
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(orders);
        }
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Title title={`Order ID: ${item.id}`} subtitle={`Date: ${new Date(item.date).toLocaleDateString()}`} />
            <Card.Content>
                <Text style={styles.total}>Total: Rs. {item.total}</Text>
                {item.items.map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                        <Text style={styles.itemText}>{item.name}</Text>
                        <Text style={styles.itemText}>Qty: {item.quantity}</Text>
                        <Text style={styles.itemText}>Price: Rs. {item.price}</Text>
                    </View>
                ))}
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Order History</Text>
            <Searchbar
                placeholder="Search Orders"
                onChangeText={handleSearch}
                value={searchQuery}
                style={styles.searchbar}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#6200EE" style={styles.loading} />
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text style={styles.noOrders}>No orders found</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    searchbar: {
        marginBottom: 20,
    },
    card: {
        marginBottom: 15,
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    itemText: {
        fontSize: 16,
    },
    loading: {
        marginTop: 50,
    },
    noOrders: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
});

export default OrderHistoryScreen;

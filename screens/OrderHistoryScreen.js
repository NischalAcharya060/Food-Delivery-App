import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Card, Searchbar, Chip } from 'react-native-paper';

const OrderHistoryScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const auth = getAuth();
    const firestore = getFirestore();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
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

    const handleSearch = (query) => {
        setSearchQuery(query);
        filterAndSortOrders(query, filterStatus);
    };

    const handleFilter = (status) => {
        setFilterStatus(status);
        filterAndSortOrders(searchQuery, status);
    };

    const filterAndSortOrders = (query, status) => {
        let updatedOrders = orders;
        if (status !== 'All') {
            updatedOrders = updatedOrders.filter(order => order.status === status);
        }
        if (query) {
            updatedOrders = updatedOrders.filter(order =>
                order.items.some(item =>
                    item.name.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
        setFilteredOrders(updatedOrders);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders().then(() => setRefreshing(false));
    };

    const renderItem = ({ item, index }) => (
        <Card style={styles.card}>
            <Card.Title title={`Order #${index + 1} (ID: ${item.id})`} subtitle={`Date: ${new Date(item.date).toLocaleDateString()}`} />
            <Card.Content>
                <Text style={styles.total}>Total: Rs. {item.total}</Text>
                {item.items.map((orderItem, itemIndex) => (
                    <View key={itemIndex} style={styles.itemContainer}>
                        <Text style={styles.itemText}>{orderItem.name}</Text>
                        <Text style={styles.itemText}>Qty: {orderItem.quantity}</Text>
                        <Text style={styles.itemText}>Price: Rs. {orderItem.price}</Text>
                    </View>
                ))}
                <View style={styles.separator} />
                <Text style={styles.statusBadge}>{item.status}</Text>
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
            <View style={styles.filterContainer}>
                {['All', 'Delivered', 'Pending', 'Cancelled'].map(status => (
                    <Chip
                        key={status}
                        selected={filterStatus === status}
                        onPress={() => handleFilter(status)}
                        style={styles.chip}
                    >
                        {status}
                    </Chip>
                ))}
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#6200EE" style={styles.loading} />
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
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
        color: '#6200EE',
    },
    searchbar: {
        marginBottom: 20,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    chip: {
        color: '#fff',
    },
    card: {
        marginBottom: 15,
        elevation: 3,
        borderRadius: 8,
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
    separator: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 10,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default OrderHistoryScreen;

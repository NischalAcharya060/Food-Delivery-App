import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NetworkStatus = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            if (!state.isConnected) {
                setModalVisible(true);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleRetry = async () => {
        const netInfo = await NetInfo.fetch();
        setIsConnected(netInfo.isConnected);
        if (netInfo.isConnected) {
            setModalVisible(false);
        }
    };

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.text}>No Internet Connection</Text>
                    <Button title="Retry" onPress={handleRetry} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
    },
    text: {
        color: 'black',
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 18,
    },
});

export default NetworkStatus;

import { Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

type Joker = {
    name: string,
    icon?: any,
    onPress: (name: string) => void,
    isUsed: boolean
}

const Joker = ({ name, icon, onPress, isUsed }: Joker) => {

    const handleOnPress = () => {
        if (isUsed != true) {
            onPress(name)
        }
    }

    return (
        <TouchableOpacity onPress={handleOnPress} style={{ paddingHorizontal: 16, paddingVertical:2, borderWidth: 1, borderRadius: 15, borderColor: 'red', marginBottom:5, marginHorizontal:10, backgroundColor: isUsed ? 'red' : 'linen' }}>
            {icon}
        </TouchableOpacity>
    )
}

export default Joker
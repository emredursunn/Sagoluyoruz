import { Text, TouchableOpacity } from 'react-native'
import React, { Dispatch, SetStateAction, useState } from 'react'


export type Option = {
    optionIndex?: number,
    songId: number,
    text: string,
    isCorrect: boolean,
    color: string,
    check?: (optionIndex: number) => void,
    setIsDisabled: Dispatch<SetStateAction<boolean>>
}

const OptionComponent = ({ optionIndex, text, color, check, setIsDisabled }: Option) => {

    const [isSelected, setSelected] = useState(false)

    const handleOnPress = () => {
        if (!isSelected) {
            setSelected(true)
            setIsDisabled(true)
            setTimeout(() => {
                setSelected(false)
                if (check && optionIndex !== undefined) {
                    check(optionIndex)
                }
                else {
                    console.log("error")
                }
            }, 2000)
        }
    }


    return (
        <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 20, margin: 5, backgroundColor: isSelected ? "orange" : color }} onPress={isSelected ? undefined : handleOnPress}>
            <Text style={{ color: 'white', fontSize: 18 }}>{text}</Text>
        </TouchableOpacity>
    )
}

export default OptionComponent

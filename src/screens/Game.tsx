import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import OptionComponent, { Option } from '../components/OptionComponent'
import songList from '../utils/songList'
import Joker from '../components/Joker'
import { Audio } from 'expo-av';
import { FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Song } from '../types/song'





const Game = () => {

    const [song, setSong] = useState<Song | null>(null)
    const [questionText, setQuestionText] = useState("")
    const [questionNumber, setQuestionNumber] = useState(0)
    const [score, setScore] = useState(0)
    const [isDisabled, setIsDisabled] = useState(false)
    const [hasFinished, setHasFinished] = useState(false)
    const [usedLyrics, setUsedLyrics] = useState<string[]>([])
    const [options, setOptions] = useState<Option[]>([])
    const [jokers, setJokers] = useState<Joker[]>([])
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isVisible, setIsVisible] = useState(false)


    useEffect(() => {
        generateQuestion()
        setJokers([
            { name: '%50', icon: <MaterialCommunityIcons name="fraction-one-half" size={24} color="black" />, isUsed: false, onPress: () => useJoker('%50') },
            { name: 'beat', icon: <FontAwesome5 name="headphones" size={24} color="black" />, isUsed: false, onPress: () => useJoker('beat') },
            { name: 'info', icon: <Feather name="info" size={24} color="black" />, isUsed: false, onPress: () => useJoker('info') }
        ])
    }, [])


    const generateQuestion = () => {
        const songId = Math.floor(Math.random() * songList.length)
        const lyrics = songList[songId].songLyrics
        const lyricsId = Math.floor(Math.random() * lyrics.length)
        const question = lyrics[lyricsId]
        if (usedLyrics.includes(question)) {
            generateQuestion()
        } else {
            if (sound) {
                sound.unloadAsync();
            }
            setSong(songList[songId])
            setUsedLyrics((prev) => [...prev, question])
            setQuestionText(question)
            setIsVisible(false)
            setQuestionNumber((prev) => prev + 1)
            const trueOption: Option = {
                songId,
                text: songList[songId].songName,
                isCorrect: true,
                color: 'tomato',
                setIsDisabled
            }
            const wrongOptions = generateWrongOptions(songId)
            const allOptions = [trueOption, ...wrongOptions]
            shuffleArray(allOptions)
            const optionsWithIndex = allOptions.map((option, index) => ({ ...option, optionIndex: index, check: () => checkOptions(index) }))
            setOptions(optionsWithIndex)
            setIsDisabled(false)
        }
    }

    const generateWrongOptions = (correctSongId: number) => {
        const wrongOptions: Option[] = []
        const usedIndexes: number[] = [correctSongId]

        while (wrongOptions.length < 3) {
            const songId = Math.floor(Math.random() * songList.length)
            if (!usedIndexes.includes(songId)) {
                const text = songList[songId].songName
                wrongOptions.push({
                    songId,
                    text,
                    isCorrect: false,
                    color: 'tomato',
                    setIsDisabled,
                })
                usedIndexes.push(songId)
            }
        }
        return wrongOptions
    }

    const checkOptions = (optionIndex: number) => {
        setIsDisabled(true)
        setOptions(prevOptions => {
            return prevOptions.map((option, index) => {
                if (option.isCorrect) {
                    if (index == optionIndex) {
                        setScore((prev) => prev + 100)
                    }
                    return { ...option, color: 'green' }
                } else {
                    if (index === optionIndex) {
                        setHasFinished(true)
                        return { ...option, color: 'red' }
                    }
                    return { ...option, color: 'gray' }
                }
            })
        });
    }

    async function playSound(beat: any) {
        try {
            console.log('Loading Sound');
            const { sound } = await Audio.Sound.createAsync(beat)
            setSound(sound);
            console.log('Playing Sound');
            await sound.playAsync();
        } catch (error) {
            console.log(error)
        }
    }

    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = array[i]
            array[i] = array[j]
            array[j] = temp
        }
    }


    const useJoker = (name: string) => {
        switch (name) {
            case '%50':
                const correctOptionIndex = options.findIndex(option => option.isCorrect);
                const incorrectOptionsIndexes = options
                    .filter((option, index) => index !== correctOptionIndex && !option.isCorrect)
                    .map(option => option.optionIndex);
                // Randomly select one of the incorrect options to keep
                const optionToKeepIndex = incorrectOptionsIndexes[Math.floor(Math.random() * incorrectOptionsIndexes.length)];

                // Update options to keep the correct option and the randomly selected incorrect option
                setOptions(prevOptions => {
                    return prevOptions.map((option, index) => {
                        if (index === correctOptionIndex || index === optionToKeepIndex) {
                            return { ...option, color: 'tomato' };
                        } else {
                            return { ...option, color: 'transparent', };
                        }
                    });
                });
                break;
            case 'beat':
                try {
                    if (song) {
                        const beat = song.songBeat
                        playSound(beat)
                    }
                } catch (error) {
                    console.log(error)
                }
                break;
            case 'info':
                setIsVisible(true)
            default:
                break;
        }
        setJokers(prevJokers => prevJokers.map(joker => {
            if (joker.name === name) {
                return { ...joker, isUsed: true };
            } else {
                return joker;
            }
        }));
    }

    const restart = () => {
        setScore(0)
        setQuestionNumber(0)
        setHasFinished(false)
        setUsedLyrics([])
        setJokers([
            { name: '%50', icon: <MaterialCommunityIcons name="fraction-one-half" size={24} color="black" />, isUsed: false, onPress: () => useJoker('%50') },
            { name: 'beat', icon: <FontAwesome5 name="headphones" size={24} color="black" />, isUsed: false, onPress: () => useJoker('beat') },
            { name: 'info', icon: <Feather name="info" size={24} color="black" />, isUsed: false, onPress: () => useJoker('info') }
        ])
        setIsVisible(false)
        generateQuestion()
    }

    return (
        <View style={{ flex: 1, padding: 15, backgroundColor: '#feefe5' }}>
            {questionNumber === 48 ? (
                <View style={{ flex: 1, backgroundColor:'linen', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 40, fontWeight: 'bold'}}>SEN BİR SAGO BAĞIMLISISIN!</Text>
                    <TouchableOpacity style={{ backgroundColor: 'green', borderWidth: 2, padding: 15, borderRadius: 10, marginTop:25 }} onPress={restart}>
                        <Text style={{ color: 'white' }}>TEKRAR OYNA</Text>
                    </TouchableOpacity>
                </View>
            )
                :
                <View style={{ flex: 1, padding: 20, borderWidth: 2, borderColor: 'black', borderRadius: 60, backgroundColor: '#e2e8ce', marginTop: 15 }}>
                    <Text style={{ fontSize: 30, fontStyle: 'italic', fontWeight: 'bold', color: 'tomato', alignSelf: 'center' }}>SAGOLUYORUZ</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', paddingTop: 40 }}>SORU: {questionNumber}</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', paddingTop: 40 }}>SKOR: {score}</Text>
                    </View>
                    <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center', padding: 15, paddingBottom: 0, flexDirection: 'row' }}>
                        <Image source={require('../../assets/sagopa.png')} style={{ width: '25%', height: '50%', marginLeft: 20, borderRadius: 40 }} />
                        <Text style={{ color: 'black', fontStyle: 'italic', fontSize: 18, marginHorizontal: 20 }}>{questionText}</Text>
                    </View>
                    {isVisible && <>
                        <Text style={{ fontSize: 14 }}>Albüm: {song?.songAlbume}</Text>
                        <Text style={{ fontSize: 14 }}>Çıkış Tarihi: {song?.songDate}</Text>
                    </>
                    }
                    <View style={{ flex: 3, pointerEvents: isDisabled ? 'none' : 'auto' }} >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                            {jokers.map((joker, index) => (
                                <Joker key={index.toString()} name={joker.name} icon={joker.icon} isUsed={joker.isUsed} onPress={() => useJoker(joker.name)} />
                            ))}
                        </View>
                        <View style={{ flexDirection: 'column' }}>
                            {options.map((option, index) => (
                                <OptionComponent key={index.toString()} {...option} />
                            ))}
                        </View>
                    </View>
                    {score / 100 == questionNumber && !hasFinished ? <TouchableOpacity style={{ backgroundColor: 'green', alignSelf: 'center', borderWidth: 2, padding: 15, borderRadius: 10, marginTop: isVisible ? 10 : 0 }} onPress={generateQuestion}>
                        <Text style={{ color: 'white' }}>SIRADAKİ</Text>
                    </TouchableOpacity>
                        : (hasFinished ? <TouchableOpacity style={{ backgroundColor: 'red', alignSelf: 'center', borderWidth: 2, padding: 15, borderRadius: 10, marginTop: isVisible ? 10 : 0 }} onPress={restart}>
                            <Text style={{ color: 'white' }}>TEKRAR OYNA</Text>
                        </TouchableOpacity> : null)}

                </View>
            }
        </View>
    )
}

export default Game

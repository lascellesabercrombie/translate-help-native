import { Ionicons } from '@expo/vector-icons';
import { View, Pressable, StyleSheet, GestureResponderEvent } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContext, useState } from 'react';
import TooltipModal from '@/components/TooltipModal';
import { Link, useLocalSearchParams } from 'expo-router';
import { TextContext } from '@/app/_layout';
import { parseDefinitions } from '@/helpers/parseDefinitions';

export default function Text() {
    const {id} = useLocalSearchParams();
    const textContext = useContext(TextContext);
    const texts = textContext?.texts;

  const [definitions, setDefinitions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState<Array<[number, string]>>([]);
  const [isLongPress, setIsLongPress] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  
  const fetchDefinition = async (word: string) => {
    setLoading(true);
    //TODO: better handling of multi-character words
    try {
      const apiUrl = `https://en.wiktionary.org/w/api.php?action=parse&format=json&prop=wikitext&page=${encodeURIComponent(word)}&origin=*`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.parse && data.parse.wikitext) {
        const wikitext = data.parse.wikitext['*'];
        // take the entry text after ==Chinese== and before any other language sections
        const sections = wikitext.split("==Chinese==")[1];
        const chineseSection = sections.split(/\n==[\w]+==\n/)[0]
        if (chineseSection) {
          // it looks like single characters get a definition section, while multi-character words get a part of speech section. Current set-up not exhaustive and doesn't properly cover cases (which may exist) where there are multiple parts of speech headings.
          const definitionsSection = chineseSection.split('===Definitions===')[1];
          const nounSection = chineseSection.split('===Noun===')[1];
          const verbSection = chineseSection.split('===Verb===')[1];
          const idiomSection = chineseSection.split('===Idiom===')[1];
          const textToParse = definitionsSection || nounSection || verbSection || idiomSection;
          if (textToParse) {
              const parsedDefinitions = parseDefinitions(textToParse) || [];
              setDefinitions(parsedDefinitions);
            } else {
              setDefinitions(['No definitions found.']);
            }
        } else {
          setDefinitions(['No Chinese section found.']);
        }
      } else {
        setDefinitions(['No definition data found.']);
      }
    } catch (error) {
      console.error('Error fetching definition:', error);
      setDefinitions(['Error fetching definition']);
    } finally {
      setLoading(false);
    }
  };

  const handleWordPressOut = (word: string, event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setDefinitions([]);
    setIsModalVisible(true);
    fetchDefinition(word);
    setTooltipPosition({ x: pageX, y: pageY });
  };

  const handleCloseModal = () => {
    setIsLongPress(false);
    setIsModalVisible(false);
    setSelectedCharacters([]);
    setSelectedWord('');
  }

  const text = texts?.find((text) => id === text.id.toString());
  const words = text?.original.text.split('');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<Ionicons size={310} name="language" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{text?.original.title}</ThemedText>
      </ThemedView>
      <View style={styles.container}>
    <View style={styles.textContainer}>
      {words ? words.map((word, index) => {
        if (word === '\n') {
          return <View key={index} style={{ width: '100%', height: 0 }}></View>;
        } else if (word.match(/\p{Script=Han}/u)) {
          return (
            <Pressable key={index}
            onPressOut={
              //TODO: styling for long-press selection
              //TODO: handle user clicking elsewhere to cancel selection
              //
              (event) => {
                // definition for a single character
                if (!isLongPress) {
                  setSelectedWord(word);
                  handleWordPressOut(word, event)
                }
                else {
                  if (selectedCharacters.length === 0) {
                    setSelectedCharacters([[index, word]]);
                  }
                  else if (selectedCharacters?.length > 0 && index === selectedCharacters?.[0]?.[0]) {
                    setIsLongPress(false);
                  }
                  // definition for a multi-character word
                  else {
                    let multiCharacterWord = words.slice(selectedCharacters?.[0][0], index + 1).join('');
                    setSelectedWord(multiCharacterWord);
                    handleWordPressOut(multiCharacterWord, event)
                  }
                }
              }
            }
              onLongPress={
                () => {setIsLongPress(true)}}>
              <ThemedText type="default">{word}</ThemedText>
            </Pressable>
          );
        } else {
          return (<ThemedText key={index} >{word}</ThemedText>);
        }
      }) : 
      <Link href="../"><ThemedText>Select a text</ThemedText></Link>}
    </View>
          <TooltipModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          selectedWord={selectedWord}
          definitions={definitions}
          loading={loading}
          position={tooltipPosition}
        />
    </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  container: {
    padding: 10,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    fontSize: 18,
    marginRight: 5,
  },
});

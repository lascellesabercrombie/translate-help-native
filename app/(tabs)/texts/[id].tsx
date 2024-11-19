import { Ionicons } from '@expo/vector-icons';
import { View, Pressable, StyleSheet, GestureResponderEvent } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCallback, useContext, useEffect, useState } from 'react';
import TooltipModal from '@/components/TooltipModal';
import { Link, useLocalSearchParams } from 'expo-router';
import { parseDefinitions } from '@/helpers/parseDefinitions';
import { useSQLiteContext } from 'expo-sqlite';
import { TextContext } from '@/app/_layout';
import { Text as TextType } from '@/types/data';

export default function Text() {

  const { id } = useLocalSearchParams();
  if (typeof id !== 'undefined' && typeof id !== 'string') {
    throw new Error(`Unhandled id type: ${id}, typeof ${typeof id}`);
  }
  const textContext = useContext(TextContext);
  const db = useSQLiteContext();

  const [text, setText] = useState<TextType | null>(null);
  const [words, setWords] = useState<string[]>([]);
  
  const setSelectedTextId = textContext?.setSelectedTextId;


useEffect(() => {
  const fetchData = async () => {
    const allRows: TextType | null = await db.getFirstAsync(
      'SELECT * FROM texts WHERE texts.id = ?;', [parseInt(id)]);
    if (allRows) {
      setText(allRows);
      setWords(allRows.text?.split(''));
    } 
    if (id && setSelectedTextId) {
      setSelectedTextId(parseInt(id));
    }
  };
  fetchData();
}, [id]);

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
    //TODO: it seems like simplified characters are not being parsed correctly. Consider redirecting in those cases to the traditional character page and presenting definition from there.
    try {
      const apiUrl = `https://en.wiktionary.org/w/api.php?action=parse&format=json&prop=wikitext&page=${encodeURIComponent(word)}&origin=*`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.parse && data.parse.wikitext) {
        const wikitext = data.parse.wikitext['*'];
        // take the entry text after ==Chinese== and before any other language sections
        const chineseSection = wikitext.split("==Chinese==")?.[1]?.split(/\n==[\w]+==\n/)[0]
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

  // const text = texts?.find((text) => id === text.id.toString());
  

  function isCharacterSelected (index: number) {
    const isSelected = selectedCharacters.some(([firstElement]) => {
      return firstElement === index;
    });
    return isSelected;
  };

  const isCharacterInRange = useCallback((index: number) => {
    if (selectedCharacters.length !== 2) return false;
    //TODO: handle case where user selects characters in reverse order
    const [start, end] = [
      selectedCharacters[0][0],
      selectedCharacters[1][0]
    ]
    return index >= start && index <= end;
  }, [selectedCharacters]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<Ionicons size={310} name="language" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{text?.title}</ThemedText>
      </ThemedView>
      <View style={styles.container}>
    <View style={styles.textContainer}>
      {words.length > 0 ? words.map((word, index) => {
        if (word === '\n') {
          return <View key={index} style={{ width: '100%', height: 0 }}></View>;
        } else if (word.match(/\p{Script=Han}/u)) {
          return (
            <Pressable key={index}
            style={[
              isCharacterSelected(index) && styles.selectedButton,
              isCharacterInRange(index) && styles.rangeSelectedButton,
            ]}
            onPressOut={
              //TODO: styling for long-press selection
              //TODO: handle user clicking elsewhere to cancel selection
              //
              (event) => {
                // definition for a single character
                if (!isLongPress) {
                  setSelectedCharacters([[index, word]]);
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
                    //TODO: handle case where user selects characters in reverse order
                    let multiCharacterWord = words.slice(selectedCharacters?.[0][0], index + 1).join('');
                    setSelectedCharacters([...selectedCharacters, [index, word]]);
                    setSelectedWord(multiCharacterWord);
                    handleWordPressOut(multiCharacterWord, event)
                  }
                }
              }
            }
              onLongPress={
                () => {
                  //TODO: styling for long-press selection
                  setIsLongPress(true)}}>
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
  rangeSelectedButton: {
    backgroundColor: '#69A1FF',
    borderColor: '#0056B3',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
    borderColor: '#0056B3',
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

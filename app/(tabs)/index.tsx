import { Ionicons } from '@expo/vector-icons';
import { View, Pressable, StyleSheet, GestureResponderEvent } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import TooltipModal from '@/components/TooltipModal';

export default function Practice() {

  const [selectedWord, setSelectedWord] = useState('');
  const [definitions, setDefinitions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);

  // TODO: allow user to select text
  const text = '你好，世界！';

  const fetchDefinition = async (word: string) => {
    setLoading(true);
    try {
      const apiUrl = `https://en.wiktionary.org/w/api.php?action=parse&format=json&prop=wikitext&page=${encodeURIComponent(word)}&origin=*`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.parse && data.parse.wikitext) {
        const wikitext = data.parse.wikitext['*'];
        const sections = wikitext.split("==Chinese==")[1];
        const chineseSection = sections.split(/\n==[\w]+==\n/)[0]
        if (chineseSection) {
          const definitionsSection = chineseSection.split('===Definitions===')[1];
          if (definitionsSection) {
            const definitionsMatch = definitionsSection.match(/# .+/g);
            if (definitionsMatch) {
              const parsedDefinitions = definitionsMatch.map((def: string) => {
                return def.replace(/^# /, '')
                          .replace(/\[\[/g, '')
                          .replace(/\]\]/g, '')
                          .replace(/\{\{.+?\}\}/g, '')
                          .trim();
              });
              setDefinitions(parsedDefinitions);
            } else {
              setDefinitions(['No definitions found.']);
            }
          } else {
            setDefinitions(['No Definitions section found.']);
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


  const handleWordPress = (word: string, event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setSelectedWord(word);
    setDefinitions([]);
    setIsModalVisible(true);
    fetchDefinition(word);
    setTooltipPosition({ x: pageX, y: pageY });
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedWord('');
  }

  const words = text.split('');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<Ionicons size={310} name="language" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Practice</ThemedText>
      </ThemedView>
      <View style={styles.container}>
      <View style={styles.textContainer}>
        {words.map((word, index) => {
          if (word.match(/\p{Script=Han}/u)) {
          return (
          <Pressable key={index} onPress={(event) => handleWordPress(word, event)}>
            <ThemedText type="default">{word}</ThemedText>
          </Pressable>
        )} else {
          return (<ThemedText key={index} style={styles.word}>{word}</ThemedText>)
        }
      })}     
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

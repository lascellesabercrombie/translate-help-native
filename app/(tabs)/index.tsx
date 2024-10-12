import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable, Modal, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SetStateAction, useState } from 'react';


export default function Practice() {

  const [selectedWord, setSelectedWord] = useState('');
  const [definitions, setDefinitions] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleWordPress = (word: string) => {
    setSelectedWord(word);
    setDefinitions([]);
    setModalVisible(true);
    fetchDefinition(word);
  };

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
        {words.map((word, index) => (
          <Pressable key={index} onPress={() => handleWordPress(word)}>
            <Text style={styles.word}>{word}</Text>
          </Pressable>
        ))}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.selectedWord}>{selectedWord}</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                data={definitions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Text style={styles.definition}>{item}</Text>}
              />
            )}
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  stepContainer: {
    gap: 8,
    marginBottom: 8,
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
modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContent: {
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 10,
  width: '80%',
  maxHeight: '80%',
},
selectedWord: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 10,
},
definition: {
  fontSize: 16,
  marginBottom: 5,
},
closeButton: {
  marginTop: 20,
  alignSelf: 'flex-end',
},
closeButtonText: {
  color: 'blue',
  fontSize: 18,
},
});
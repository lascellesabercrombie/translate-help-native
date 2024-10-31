import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContext, useEffect, useState } from 'react';
import { View, Modal } from 'react-native';
import { TextContext } from '@/app/_layout';
import { useSQLiteContext } from 'expo-sqlite';
import { Text as TextType } from '@/types/data';

export default function Write() {
  const db = useSQLiteContext();
  const textContext = useContext(TextContext);
  const selectedTextId = textContext?.selectedTextId;
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState(1);
  const [language, setLanguage] = useState('en');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  function handlePress () {
    setDropdownVisible(!dropdownVisible);
  };

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      if (!selectedTextId) {
        // console.error('No id found');
        return;
      }
      const allRows: TextType | null = await db.getFirstAsync(
          'SELECT * FROM texts WHERE texts.original_text_id = ?;', [selectedTextId]);
        if (allRows) {
          setText(allRows.text);
          setTitle(allRows.title);
          setAuthorId(allRows.author_id);
          setLanguage(allRows.language);
      } 
    };
    
    fetchData();

    return () => {
      mounted = false;
    };
  }, [selectedTextId]);

  async function handlePressSaveButton () {
    if (selectedTextId === undefined || selectedTextId === null) {
      throw new Error('No original text id found');
    }
    try {
      const result = await db.runAsync(`INSERT INTO texts 
        (title, author_id, language, text, is_translation, original_text_id) 
        VALUES (?, ?, ?, ?, ?, ?);`, [title, authorId, language, text, 1, selectedTextId]);
    } catch {
      console.error('Failed to save translation');
    }
    
  };

    return (
      <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={<Ionicons size={310} name="pencil" style={styles.headerImage} />}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Write</ThemedText>
        </ThemedView>
          <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.textInput}
          ></TextInput>
           <TextInput
          value={language}
          onChangeText={setLanguage}
          style={styles.textInput}
          ></TextInput> 
            <TextInput
            value={text}
            multiline={true}
            onChangeText={setText}
            style={styles.textInput}>
            </TextInput>
        <Pressable onPress={handlePressSaveButton}>
          <ThemedText>Save</ThemedText>
        </Pressable>
      </ParallaxScrollView>
         <Modal visible={dropdownVisible} transparent={true} animationType="fade">
         <View style={styles.modalContainer}>
           {/* <FlatList
             data={texts}
             keyExtractor={(item) => item.id.toString()}
             renderItem={({ item }) => (
               <Pressable onPress={() => handleSelect(item)} style={styles.dropdownItem}>
                 <ThemedText>{item.original.title}</ThemedText>
               </Pressable>
             )}
           /> */}
         </View>
       </Modal>
       </>
    );
}

const styles = StyleSheet.create({
headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
},
textInput: {
    color: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
},
titleContainer: {
    flexDirection: 'row',
    gap: 8,
},
modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
dropdownItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
},
});
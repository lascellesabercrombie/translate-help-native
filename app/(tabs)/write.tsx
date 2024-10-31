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
  const [textObject, setTextObject] = useState<Partial<TextType> | null>(null);
  const [text, setText] = useState('');
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
          setTextObject(allRows);
          setText(allRows.text);
      } 
    };
    
    fetchData();

    return () => {
      mounted = false;
    };
  }, [selectedTextId]);

  function handlePressSaveButton () {
    if (selectedTextId === undefined || selectedTextId === null) {
      throw new Error('No original text id found');
    }
    setTextObject(prevState => {
    if (!prevState) return {
      text: text,
      original_text_id: selectedTextId,
    };
    return {
      ...prevState,
      text: text
    };
  });
    let title = textObject?.title || 'title';
    let author_id = textObject?.author_id || 1;
    let language = textObject?.language || 'en';
    db.runAsync(`INSERT INTO texts 
      (title, author_id, language, text, is_translation, original_text_id) 
      VALUES (?, ?, ?, ?, ?, ?);`, [title, author_id, language, text, 1, selectedTextId]);
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
    height: 200,
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
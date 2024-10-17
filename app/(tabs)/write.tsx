import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContext, useState } from 'react';
import { View, Text, Modal, FlatList } from 'react-native';
import { TextContext, TextType } from '@/app/_layout'


export default function Write() {
  const textContext = useContext(TextContext);
  const texts = textContext?.texts;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedText, setSelectedText] = useState(texts?.[0]);

  function handlePress () {
    setDropdownVisible(!dropdownVisible);
  };

  function handleSelect (text: TextType) {
    setSelectedText(text);
    setDropdownVisible(false);
  };

  function handleChange () {
    console.log('change')
  }
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={<Ionicons size={310} name="pencil" style={styles.headerImage} />}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Write</ThemedText>
        </ThemedView>
        {texts ? <Pressable onPress={handlePress}>
          <Text>{selectedText?.originalTitle}</Text>
          <Modal visible={dropdownVisible} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
              <FlatList
                data={texts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Pressable onPress={() => handleSelect(item)} style={styles.dropdownItem}>
                    <ThemedText>{item.originalTitle}</ThemedText>
                  </Pressable>
                )}
              />
            </View>
          </Modal>
        </Pressable> : null}
        <TextInput
        multiline={true}
        onChangeText={handleChange}>
        </TextInput>
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
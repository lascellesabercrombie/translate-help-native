import { Modal, View, Text, Pressable, ActivityIndicator, FlatList, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LINE_HEIGHT = 20;
const ARROW_HEIGHT = 10;

interface TooltipModalProps {
  visible: boolean;
  onClose: () => void;
  selectedWord: string;
  definitions: string[];
  loading: boolean;
  position: { x: number; y: number };
}

export default function TooltipModal ({ 
  visible, 
  onClose, 
  selectedWord, 
  definitions, 
  loading, 
  position,
}: TooltipModalProps) {

    // TODO: replace with dynamic positioning based on word length and line height
    const tooltipPosition = {
        left: position.x - 20,
        top: position.y + 20,
      };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.tooltipContainer, tooltipPosition]}>
          <View style={styles.tooltipContent}>
            {/* // heavily truncated tooltip (both horizontally and vertically
            hidden text shown by ellipsis); on double click expand to show full 
            definitions */}
            <Text style={styles.selectedWord}>{selectedWord}</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <FlatList
                data={definitions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Text style={styles.definition} numberOfLines={1}>{item}</Text>}
              />
            )}
          </View>
            {/* Arrow to go here */}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  tooltipContainer: {
    position: 'absolute',
    maxWidth: SCREEN_WIDTH * 0.8,
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  tooltipContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    maxWidth: 200,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedWord: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  definition: {
    fontSize: 14,
    marginBottom: 4,
},
});
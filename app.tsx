import { Image, StyleSheet, View, Button, SafeAreaView, AppRegistry, TouchableOpacity, Text, Modal } from 'react-native';
import React, { useState, useRef } from 'react';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import axios from 'axios';

export default function HomeScreen() {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const svgRef = useRef(null);
  const canvasRef = useRef(null);

  const handleTouchMove = (event: { nativeEvent: { locationX: any; locationY: any; }; }) => {
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);
  };

  const handleTouchStart = (event: { nativeEvent: { locationX: any; locationY: any; }; }) => {
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath(`M ${locationX} ${locationY}`);
  };

  const handleTouchEnd = () => {
    setPaths((prev) => [...prev, currentPath]);
    setCurrentPath('');
  };

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath('');
  };

  const captureDrawing = async () => {
    try {
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'base64', // Capture the image as a Base64 string
      });
      setCapturedImage(uri);

      // Send the captured image to the backend
      await axios.post('https://your-backend-endpoint.com/upload', {
        image: uri,
      });
      console.log('Image uploaded successfully');
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        ref={canvasRef}
        style={styles.canvas}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderStart={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
      >
        <Svg ref={svgRef} style={styles.svg}>
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke="black"
              strokeWidth={3}
              fill="none"
            />
          ))}
          {currentPath && (
            <Path
              d={currentPath}
              stroke="black"
              strokeWidth={3}
              fill="none"
            />
          )}
        </Svg>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearCanvas}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.voteButton]} onPress={captureDrawing}>
          <Text style={styles.buttonText}>Vote</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  canvas: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  svg: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  button: {
    flex: 1,
    padding: 30,
    borderRadius: 0,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: 'red',
  },
  voteButton: {
    backgroundColor: 'green',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  capturedImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
});

AppRegistry.registerComponent('main', () => HomeScreen);
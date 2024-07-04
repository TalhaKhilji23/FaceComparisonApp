import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Modal } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios'; // Import Axios for making HTTP requests
import RNFS from 'react-native-fs'; // Import react-native-fs for file system operations


export default function App() {
  const [selectedImage1, setSelectedImage1] = useState(null);
  const [selectedImage2, setSelectedImage2] = useState(null);
  const [similarity, setSimilarity] = useState();
  const [isMatchFound, setIsMatchFound] = useState();

  const openGallery = (setImage) => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
    };
    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User canceled');
      } else if (response.errorCode) {
        console.log(response.errorCode, 'err ');
      } else {
        const selectedUri = response.assets[0].uri;
        setImage(selectedUri);
      }
    });
  };
   const openCamera = (setImage) => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
    };
    ImagePicker.launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User canceled camera');
      } else if (response.errorCode) {
        console.log(response.errorCode, 'camera err ');
      } else {
        const selectedUri = response.assets[0].uri;
        setImage(selectedUri);
      }
    });
  };
  const checkMatch = async () => {
  try {
    if (!selectedImage1 || !selectedImage2) {
      console.log('Please select two images');
      return;
    }

    // Encode selected images as base64 strings
    
    const imageBuffer1 = await getImageBuffer(selectedImage1);
    const imageBuffer2 = await getImageBuffer(selectedImage2);

    const formData = {
      image1: imageBuffer1,
      image2: imageBuffer2,
    };

    const response = await axios.post('http://192.168.0.13:3000/images/compare-faces', formData);
    console.log('Response:', response.data);
    console.log('Similarity:', response.data.similarity);
    console.log('Match Found:', response.data.isMatchFound);
    setSimilarity(response.data.similarity);
    setIsMatchFound(response.data.isMatchFound);

    // Handle response data here, e.g., display a message based on the match result
  } catch (error) {
    console.error('Error checking match:', error);
  }
};
const getImageBuffer = async (uri) => {
    try {
      const fileUri = `file://${uri}`;
    const imageBinary = await RNFS.readFile(fileUri, 'base64');
      return imageBinary;
    } catch (error) {
      console.error('Error reading image:', error);
      throw error;
    }
  };







  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity style={[styles.button, { marginRight: 20 }]} onPress={() => openGallery(setSelectedImage1)}>
          <Text style={styles.buttonText}>Select Image 1</Text>
        </TouchableOpacity>
        
      </View>
      {selectedImage1 && (
          <Image
            source={{ uri: selectedImage1 }}
            style={styles.image}
          />
        )}
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity style={[styles.button, { marginRight: 20 }]} onPress={() => openGallery(setSelectedImage2)}>
          <Text style={styles.buttonText}>Select Image 2</Text>
        </TouchableOpacity>
         <TouchableOpacity style={styles.button} onPress={() => openCamera(setSelectedImage2)}>
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
        
      </View>
      {selectedImage2 && (
          <Image
            source={{ uri: selectedImage2 }}
            style={styles.image}
          />
        )}
      <TouchableOpacity style={[styles.button, { marginRight: 20 }]} onPress={checkMatch}>
        <Text style={styles.buttonText}>Check Match</Text>
      </TouchableOpacity>
        {isMatchFound != null && (
      <Text style={{ fontWeight: '600',fontSize:18, marginTop: 20 , color:"red"}}>
        {isMatchFound ? 'Both images are of the same person' : 'Two different persons'}
      </Text>
    )}
     {similarity != null && (
  <Text style={{ fontWeight: '600', fontSize: 18, marginTop: 20, color: "blue" }}>
    Similarity: {parseFloat(similarity).toFixed(2)}%
  </Text>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: 'skyblue',
    height: 40,
    width: 140,
    paddingTop: 10,
    paddingLeft: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingRight: 10,
  },
  image: {
    width: 150,
    height: 200,
    resizeMode: 'cover',
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});


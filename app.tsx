import { StyleSheet, View, SafeAreaView, AppRegistry, TouchableOpacity, Text } from "react-native"
import { useState, useRef } from "react"
import Svg, { Path } from "react-native-svg"
import { captureRef } from "react-native-view-shot"
import axios from "axios"

export default function HomeScreen() {
  const [paths, setPaths] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [predictedDigits, setPredictedDigits] = useState<string[]>([])
  const svgRef = useRef(null)
  const canvasRef = useRef(null)

  const handleTouchMove = (event: { nativeEvent: { locationX: any; locationY: any } }) => {
    const { locationX, locationY } = event.nativeEvent
    setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`)
  }

  const handleTouchStart = (event: { nativeEvent: { locationX: any; locationY: any } }) => {
    const { locationX, locationY } = event.nativeEvent
    setCurrentPath(`M ${locationX} ${locationY}`)
  }

  const handleTouchEnd = () => {
    setPaths((prev) => [...prev, currentPath])
    setCurrentPath("")
  }

  const clearCanvas = () => {
    setPaths([])
    setCurrentPath("")
    setPredictedDigits([])
  }

  const captureDrawing = async () => {
    try {
      const uri = await captureRef(canvasRef, {
        format: "png",
        quality: 1,
      })
      setCapturedImage(uri)

      const formData = new FormData()
      formData.append("image", {
        uri,
        name: "drawing.png",
        type: "image/png",
      })

      // Send the captured image to the backend
      const response = await axios.post("http://172.20.10.5:3000/api/number_prediction/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      console.log("Image uploaded successfully")
      console.log("Response from backend:", response.data)

      // Extract the predicted number and candidate name from the response
      if (response.data) {
        const { predictedNumber, candidateName } = response.data
        if (candidateName) {
          setPredictedDigits([`${predictedNumber} - ${candidateName}`])
        } else {
          setPredictedDigits([`${predictedNumber} - Not Found`])
        }
      } else {
        setPredictedDigits([])
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
      setPredictedDigits([])
    }
  }

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
            <Path key={index} d={path} stroke="black" strokeWidth={15} fill="none" />
          ))}
          {currentPath && <Path d={currentPath} stroke="black" strokeWidth={10} fill="none" />}
        </Svg>
      </View>
      {predictedDigits.length > 0 && (
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionTitle}>Predicted Digits:</Text>
          <View style={styles.digitsContainer}>
            {predictedDigits.map((digit, index) => (
              <View key={index} style={styles.digitBox}>
                <Text style={styles.digitText}>{digit}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearCanvas}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.voteButton]} onPress={captureDrawing}>
          <Text style={styles.buttonText}>Vote</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  canvas: {
    width: "100%",
    height: "85%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  svg: {
    flex: 1,
  },
  predictionContainer: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    width: "100%",
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  digitsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  digitBox: {
    width: 400,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 5,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#999",
  },
  digitText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  button: {
    flex: 1,
    padding: 20,
    borderRadius: 0,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "red",
  },
  voteButton: {
    backgroundColor: "green",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

AppRegistry.registerComponent("main", () => HomeScreen)


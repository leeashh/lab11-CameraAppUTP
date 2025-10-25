import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';

export default function CameraPreview({ cameraRef, facing, flash, onCapture, onToggleFacing, onToggleFlash }) {
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} flash={flash} ref={cameraRef} />
      <View style={styles.controls}>
        <TouchableOpacity onPress={onCapture}><Text style={styles.btn}>📸 Tomar foto</Text></TouchableOpacity>
        <TouchableOpacity onPress={onToggleFacing}><Text style={styles.btn}>🔄 Cambiar cámara</Text></TouchableOpacity>
        <TouchableOpacity onPress={onToggleFlash}><Text style={styles.btn}>⚡ Flash {flash === 'off' ? 'Off' : 'On'}</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: { position: 'absolute', bottom: 30, alignSelf: 'center' },
  btn: { fontSize: 16, marginVertical: 5, color: '#fff', backgroundColor: '#00000088', padding: 8, borderRadius: 6 }
});
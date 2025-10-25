import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { loadHistory, saveHistory, saveCompat } from '../storage/Storage';
import HistoryList from '../components/List';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [savedConfirmation, setSavedConfirmation] = useState(false);
  const [photoDate, setPhotoDate] = useState(null);
  const [history, setHistory] = useState([]);
  const cameraRef = useRef(null);

  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');

  const [captured, setCaptured] = useState(null); 
  const [capturedDate, setCapturedDate] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const h = await loadHistory();
      setHistory(h);
    })();
  }, []);

  const saveToHistory = async (uri, date) => {
    try {
      const newEntry = { uri, date };
      const newHistory = [newEntry, ...history].slice(0, 3);
      setHistory(newHistory);
      await saveHistory(newHistory);
      await saveCompat(uri, date); 
    } catch (err) {
      console.error('Error guardando historial:', err);
    }
  };

  const takePicture = async () => {
    try {
      if (cameraRef.current) {
        const data = await cameraRef.current.takePictureAsync();
        const now = new Date().toLocaleString();
        setCaptured(data.uri);
        setCapturedDate(now);
        setPreviewVisible(true);
      }
    } catch (err) {
      console.error('takePicture error:', err);
    }
  };

  const handleSaveCaptured = async () => {
    if (!captured) return;
    await saveToHistory(captured, capturedDate);
    setPhoto(captured);
    setPhotoDate(capturedDate);
    setPreviewVisible(false);
    setCaptured(null);
    setCapturedDate(null);

    setSavedConfirmation(true);
    setTimeout(() => setSavedConfirmation(false), 2000);
  };

  const handleDiscardCaptured = () => {
    setPreviewVisible(false);
    setCaptured(null);
    setCapturedDate(null);
  };

  const toggleCameraType = () => setFacing((p) => (p === 'back' ? 'front' : 'back'));
  const toggleFlash = () => setFlash((p) => (p === 'off' ? 'on' : 'off'));

  if (!permission) return <Text>Cargando permisos...</Text>;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>No tienes permiso para usar la cámara.</Text>
        <TouchableOpacity style={styles.bigButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Solicitar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Modal de previsualización antes de guardar */}
      <Modal visible={previewVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {captured && <Image source={{ uri: captured }} style={styles.modalImage} />}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveCaptured}>
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.discardButton]} onPress={handleDiscardCaptured}>
                <Text style={styles.modalButtonText}>Descartar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {!photo ? (
        <>
          <CameraView style={{ flex: 1 }} ref={cameraRef} facing={facing} flash={flash} />

          <View style={styles.navbar}>
            <TouchableOpacity style={styles.navButton} onPress={toggleFlash}>
              <MaterialIcons name={flash === 'off' ? 'flash-off' : 'flash-on'} size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <HistoryList
              history={history}
              onSelect={(uri, date) => {
                setPhoto(uri);
                setPhotoDate(date);
              }}
            />

            <TouchableOpacity style={styles.shutterButton} onPress={takePicture} />

            <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraType}>
              <MaterialIcons name={facing === 'back' ? 'camera-rear' : 'camera-front'} size={30} color="white" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Image source={{ uri: photo }} style={{ flex: 1 }} />
          {photoDate && <Text style={styles.photoDate}>📅 {photoDate}</Text>}

          {savedConfirmation && (
            <View style={styles.confirmation}>
              <Text style={styles.confirmationText}>✅ Foto guardada</Text>
            </View>
          )}

          <View style={styles.footerPreview}>
            <TouchableOpacity style={styles.bigButton} onPress={() => setPhoto(null)}>
              <Text style={styles.buttonText}>Volver a cámara</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 12,
    elevation: 5,
  },
  navButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff3b3b',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  toggleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  confirmation: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: '#2ecc71',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 6,
  },
  confirmationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerPreview: {
    padding: 16,
    backgroundColor: '#000',
  },
  bigButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 200,
    marginTop: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  photoDate: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    color: '#fff',
    fontSize: 14,
    backgroundColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 10,
  },
  modalImage: {
    width: '100%',
    height: '85%',
    resizeMode: 'cover',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#111',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  discardButton: {
    backgroundColor: '#c0392b',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

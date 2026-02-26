import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { styles } from './AudioRecorder.styles'; // <-- IMPORTAMOS LOS ESTILOS

interface AudioRecorderProps {
  onAudioRecorded: (uri: string) => void;
}

export default function AudioRecorder({ onAudioRecorded }: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>; 
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
            onAudioRecorded(uri);
        }
    }
    setRecording(null); 
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="microphone-outline" size={30} color="#0B3A6E" />
        <Text style={styles.title}>Graba un Audio explicando{"\n"}el problema <Text style={styles.textLight}>(opcional)</Text></Text>
      </View>
      
      <View style={styles.player}>
        <TouchableOpacity onPress={isRecording ? stopRecording : startRecording}>
          <MaterialCommunityIcons 
            name={isRecording ? "stop-circle-outline" : "record-circle-outline"} 
            size={40} 
            color={isRecording ? "#DC2626" : "#DC2626"} 
          />
        </TouchableOpacity>
        
        <Text style={styles.time}>{formatTime(recordingDuration)}</Text>
        
        <View style={styles.progressBar}>
          {isRecording && <View style={styles.progressFillRecording} />}
        </View>
        
        <MaterialCommunityIcons name="pause-circle" size={40} color="#D9D9D9" /> 
        <Feather name="send" size={28} color="#0B3A6E" style={styles.sendIcon} /> 
      </View>
    </View>
  );
}
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from './src/screens/CameraScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CameraScreen">
        <Stack.Screen
          name="CameraScreen"
          component={CameraScreen}
          options={{ title: 'Cámara', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
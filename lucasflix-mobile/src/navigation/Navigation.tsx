import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SessionsScreen from '../screens/SessionsScreen';
import RankingsScreen from '../screens/RankingsScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import MoreScreen from '../screens/MoreScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import StartSessionScreen from '../screens/StartSessionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#141414',
          borderTopColor: '#333',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film" size={size} color={color} />
          ),
          tabBarLabel: 'Sessões',
        }}
      />
      <Tab.Screen
        name="Rankings"
        component={RankingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
          tabBarLabel: 'Rankings',
        }}
      />
    </Tab.Navigator>
  );
};

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#141414',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SessionDetail"
          component={SessionDetailScreen}
          options={{ title: 'Detalhes da Sessão' }}
        />
        <Stack.Screen
          name="StartSession"
          component={StartSessionScreen}
          options={{ title: 'Nova Sessão' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

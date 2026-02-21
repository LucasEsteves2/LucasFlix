import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  name: string;
  size?: number;
  showName?: boolean;
}

const AVATAR_MAP: Record<string, any> = {
  'Lucas': require('../assets/avatars/LucasAvatar.png'),
  'Vitória': require('../assets/avatars/VitoriaAvatar.png'),
  'Thiago': require('../assets/avatars/ThiagoAvatar.png'),
  'Diego': require('../assets/avatars/DiegoAvatar.png'),
  'Júlia': require('../assets/avatars/JuliaAvatar.png'),
  'Luca e Vitória': require('../assets/avatars/lucaVitoriaAvatar.png'),
  'Valesca': require('../assets/avatars/ValescaAvatar.png'),
  'Menta': require('../assets/avatars/MentaAvatar.png'),
};

export const Avatar: React.FC<AvatarProps> = ({ name, size = 50, showName = false }) => {
  const avatarSource = AVATAR_MAP[name] || AVATAR_MAP['Lucas'];

  return (
    <View style={styles.container}>
      <Image
        source={avatarSource}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
      {showName && <Text style={styles.name}>{name}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#E50914',
  },
  name: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});

import { StyleSheet, Text, View } from 'react-native';

export type HaemiIconName =
  | 'alarm'
  | 'album'
  | 'arrowLeft'
  | 'comment'
  | 'gear'
  | 'heart'
  | 'home'
  | 'more'
  | 'photo'
  | 'plus'
  | 'quiz'
  | 'report'
  | 'send';

type HaemiIconProps = {
  name: HaemiIconName;
  color: string;
  size?: number;
  filled?: boolean;
};

export function HaemiIcon({ name, color, size = 24, filled = false }: HaemiIconProps) {
  if (name === 'plus') {
    return <Text style={[styles.symbol, { color, fontSize: size * 1.08, lineHeight: size }]}>+</Text>;
  }

  if (name === 'heart') {
    return (
      <Text style={[styles.symbol, { color, fontSize: size * 0.92, lineHeight: size }]}>
        {filled ? '♥' : '♡'}
      </Text>
    );
  }

  if (name === 'gear') {
    return <Text style={[styles.symbol, { color, fontSize: size * 0.9, lineHeight: size }]}>⚙</Text>;
  }

  if (name === 'arrowLeft') {
    return <Text style={[styles.symbol, { color, fontSize: size, lineHeight: size }]}>‹</Text>;
  }

  if (name === 'more') {
    return <Text style={[styles.symbol, { color, fontSize: size, lineHeight: size }]}>⋮</Text>;
  }

  if (name === 'quiz') {
    return (
      <View style={[styles.quizBox, { width: size, height: size, borderColor: color }]}>
        <Text style={[styles.quizText, { color, fontSize: size * 0.56, lineHeight: size * 0.72 }]}>?</Text>
      </View>
    );
  }

  if (name === 'send') {
    return (
      <View
        style={[
          styles.send,
          {
            width: size,
            height: size,
            borderLeftColor: color,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
          },
        ]}
      />
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {name === 'alarm' && <AlarmIcon color={color} size={size} />}
      {name === 'album' && <PhotoIcon color={color} size={size} stacked />}
      {name === 'comment' && <CommentIcon color={color} size={size} />}
      {name === 'home' && <HomeIcon color={color} size={size} />}
      {name === 'photo' && <PhotoIcon color={color} size={size} />}
      {name === 'report' && <ReportIcon color={color} size={size} />}
    </View>
  );
}

function AlarmIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={[
          styles.alarmDome,
          {
            width: size * 0.62,
            height: size * 0.56,
            borderColor: color,
            borderBottomColor: color,
            borderTopLeftRadius: size * 0.34,
            borderTopRightRadius: size * 0.34,
            marginTop: size * 0.16,
          },
        ]}
      />
      <View style={[styles.alarmBase, { width: size * 0.72, backgroundColor: color }]} />
      <View style={[styles.alarmClapper, { backgroundColor: color }]} />
    </View>
  );
}

function CommentIcon({ color, size }: { color: string; size: number }) {
  return (
    <View
      style={[
        styles.commentBubble,
        {
          width: size * 0.86,
          height: size * 0.64,
          borderColor: color,
          borderRadius: size * 0.08,
        },
      ]}>
      <View style={[styles.commentLine, { width: size * 0.42, backgroundColor: color }]} />
      <View style={[styles.commentLine, { width: size * 0.32, backgroundColor: color }]} />
    </View>
  );
}

function HomeIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={[
          styles.homeRoof,
          {
            borderLeftWidth: size * 0.35,
            borderRightWidth: size * 0.35,
            borderBottomWidth: size * 0.3,
            borderBottomColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.homeBody,
          {
            width: size * 0.58,
            height: size * 0.44,
            borderBottomLeftRadius: size * 0.08,
            borderBottomRightRadius: size * 0.08,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

function PhotoIcon({ color, size, stacked = false }: { color: string; size: number; stacked?: boolean }) {
  return (
    <View style={{ width: size, height: size }}>
      {stacked && (
        <View
          style={[
            styles.photoFrame,
            {
              width: size * 0.72,
              height: size * 0.58,
              borderColor: color,
              borderRadius: size * 0.08,
              left: size * 0.03,
              top: size * 0.19,
              opacity: 0.55,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.photoFrame,
          {
            width: size * 0.72,
            height: size * 0.58,
            borderColor: color,
            borderRadius: size * 0.08,
            right: size * 0.03,
            top: size * 0.1,
          },
        ]}>
        <View style={[styles.photoSun, { width: size * 0.1, height: size * 0.1, backgroundColor: color }]} />
        <View
          style={[
            styles.photoMountain,
            {
              borderLeftWidth: size * 0.16,
              borderRightWidth: size * 0.16,
              borderBottomWidth: size * 0.18,
              borderBottomColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function ReportIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={[styles.reportBox, { width: size * 0.72, height: size * 0.78, borderColor: color }]}>
      {[0.35, 0.58, 0.28].map((height, index) => (
        <View
          key={index}
          style={[
            styles.reportBar,
            {
              height: size * height,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  symbol: {
    fontWeight: '700',
    textAlign: 'center',
  },
  alarmDome: {
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  alarmBase: {
    height: 2,
    borderRadius: 1,
    marginTop: -1,
  },
  alarmClapper: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  commentBubble: {
    borderWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  commentLine: {
    height: 2,
    borderRadius: 1,
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: 2,
  },
  homeBody: {
    marginTop: -1,
  },
  photoFrame: {
    position: 'absolute',
    borderWidth: 2,
  },
  photoSun: {
    position: 'absolute',
    left: 5,
    top: 5,
    borderRadius: 5,
  },
  photoMountain: {
    position: 'absolute',
    left: 7,
    bottom: 5,
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  quizBox: {
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizText: {
    fontWeight: '800',
    textAlign: 'center',
  },
  reportBox: {
    borderWidth: 2,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    paddingBottom: 3,
  },
  reportBar: {
    width: 3,
    borderRadius: 1.5,
  },
  send: {
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 18,
    transform: [{ scaleY: 1.1 }],
  },
});

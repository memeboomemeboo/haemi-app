import React from 'react';
import { Icon } from './Icon';
import type { IconProps } from './types';

type IndividualIconProps = Omit<IconProps, 'name'>;

export const Home: React.FC<IndividualIconProps> = (props) => <Icon name="Home" {...props} />;
export const Album: React.FC<IndividualIconProps> = (props) => <Icon name="Album" {...props} />;
export const Heart: React.FC<IndividualIconProps> = (props) => <Icon name="Heart" {...props} />;
export const HeartOutline: React.FC<IndividualIconProps> = (props) => <Icon name="HeartOutline" {...props} />;
export const HeartFilled: React.FC<IndividualIconProps> = (props) => <Icon name="HeartFilled" {...props} />;
export const Report: React.FC<IndividualIconProps> = (props) => <Icon name="Report" {...props} />;
export const Quiz: React.FC<IndividualIconProps> = (props) => <Icon name="Quiz" {...props} />;
export const Alarm: React.FC<IndividualIconProps> = (props) => <Icon name="Alarm" {...props} />;
export const Setting: React.FC<IndividualIconProps> = (props) => <Icon name="Setting" {...props} />;
export const Profile: React.FC<IndividualIconProps> = (props) => <Icon name="Profile" {...props} />;
export const Arrow: React.FC<IndividualIconProps> = (props) => <Icon name="Arrow" {...props} />;
export const Check: React.FC<IndividualIconProps> = (props) => <Icon name="Check" {...props} />;
export const Plus: React.FC<IndividualIconProps> = (props) => <Icon name="Plus" {...props} />;
export const Picture: React.FC<IndividualIconProps> = (props) => <Icon name="Picture" {...props} />;
export const Comment: React.FC<IndividualIconProps> = (props) => <Icon name="Comment" {...props} />;
export const More: React.FC<IndividualIconProps> = (props) => <Icon name="More" {...props} />;
export const MoreVertical: React.FC<IndividualIconProps> = (props) => <Icon name="MoreVertical" {...props} />;
export const Sent: React.FC<IndividualIconProps> = (props) => <Icon name="Sent" {...props} />;
export const Calendar: React.FC<IndividualIconProps> = (props) => <Icon name="Calendar" {...props} />;
export const Map: React.FC<IndividualIconProps> = (props) => <Icon name="Map" {...props} />;
export const People: React.FC<IndividualIconProps> = (props) => <Icon name="People" {...props} />;
export const CheckMark: React.FC<IndividualIconProps> = (props) => <Icon name="CheckMark" {...props} />;
export const Play: React.FC<IndividualIconProps> = (props) => <Icon name="Play" {...props} />;
export const Replay: React.FC<IndividualIconProps> = (props) => <Icon name="Replay" {...props} />;
export const Mail: React.FC<IndividualIconProps> = (props) => <Icon name="Mail" {...props} />;
export const PlayTriangle: React.FC<IndividualIconProps> = (props) => (
  <Icon name="PlayTriangle" {...props} />
);
export const Pause: React.FC<IndividualIconProps> = (props) => <Icon name="Pause" {...props} />;
export const Mic: React.FC<IndividualIconProps> = (props) => <Icon name="Mic" {...props} />;
export const Waveform: React.FC<IndividualIconProps> = (props) => <Icon name="Waveform" {...props} />;
export const Backspace: React.FC<IndividualIconProps> = (props) => <Icon name="Backspace" {...props} />;
export const Close: React.FC<IndividualIconProps> = (props) => <Icon name="Close" {...props} />;
